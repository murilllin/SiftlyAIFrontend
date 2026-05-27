import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ConversacionService } from '../../services/conversacion.service';
import { MensajeService } from '../../services/mensaje.service';
import { Mensaje } from '../../models/mensaje.model';
import { LoadingComponent } from '../shared/loading/loading.component';

const IA_ESPERADAS_TEXTO = [
  'GROQ_LLAMA3_3_70B',
  'COHERE_COMMAND_R_PLUS',
  'MISTRAL_SMALL_3',
  'GEMINI_2_5_FLASH',
  'NVIDIA_LLAMA_3_3_70B',
  'NVIDIA_NEMOTRON_3_SUPER'
];
const IA_ESPERADAS_IMAGEN = [
  'OPENROUTER_XAI_GROK_IMG',
  'OPENROUTER_RECRAFT_V3_IMG'
];
const IA_ESPERADAS_VIDEO = [
  'OPENROUTER_WAN_2_6_VIDEO',
  'OPENROUTER_VEO_3_1_LITE_VIDEO',
  'OPENROUTER_XAI_GROK_VIDEO'
];

@Component({
  selector: 'app-conversacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './conversacion-detalle.component.html',
  styleUrls: ['./conversacion-detalle.component.css']
})
export class ConversacionDetalleComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;
  @ViewChild('inputMensaje') inputMensaje!: ElementRef;

  conversacionId!: number;
  titulo = '';
  mensajes: Mensaje[] = [];
  cargandoConversacion = true;
  enviando = false;
  contenido = '';
  tipoContenido: 'TEXTO' | 'IMAGEN' | 'VIDEO' = 'TEXTO';
  error = '';

  private pollSub?: Subscription;
  private debeScroll = false;
  esperandoRespuestas = false;
  private mensajesPendientes = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private convService: ConversacionService,
    private mensajeService: MensajeService
  ) {}

  ngOnInit() {
    this.conversacionId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarConversacion(true);
    this.iniciarPolling();
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  ngAfterViewChecked() {
    if (this.debeScroll) {
      this.scrollAbajo();
      this.debeScroll = false;
    }
  }

  cargarConversacion(inicial = false) {
    this.convService.obtenerConversacion(this.conversacionId).subscribe({
      next: (data) => {
        this.titulo = data.titulo;
        this.mensajes = data.mensajes || [];
        this.cargandoConversacion = false;
        if (inicial) this.debeScroll = true;
        this.verificarPendientes();
      },
      error: (err) => {
        this.cargandoConversacion = false;
        this.esperandoRespuestas = false;
        this.error = `No se pudo cargar la conversación. Verifica que el backend esté corriendo.`;
      }
    });
  }

  iniciarPolling() {
    this.pollSub = interval(2000).subscribe(() => {
      if (this.mensajesPendientes.size > 0 || this.esperandoRespuestas) {
        this.cargarConversacion();
      }
    });
  }

  verificarPendientes() {
    this.mensajesPendientes.clear();
    for (const m of this.mensajes) {
      if (m.tipo === 'USUARIO') {
        const respRecibidas = (m.respuestasIA || []).length;
        const iaEsp = m.tipoContenido === 'IMAGEN' ? IA_ESPERADAS_IMAGEN :
                       m.tipoContenido === 'VIDEO' ? IA_ESPERADAS_VIDEO : IA_ESPERADAS_TEXTO;
        if (respRecibidas < iaEsp.length) {
          this.mensajesPendientes.add(m.id);
        }
      }
    }
    if (this.mensajesPendientes.size === 0) {
      this.esperandoRespuestas = false;
    }
  }

  onEnter(event: Event) {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) return;
    event.preventDefault();
    this.enviar();
  }

  enviar() {
    const texto = this.contenido.trim();
    if (!texto || this.enviando) return;

    this.enviando = true;
    this.error = '';

    this.mensajeService.enviarMensaje(this.conversacionId, texto, this.tipoContenido).subscribe({
      next: () => {
        this.contenido = '';
        this.enviando = false;
        this.esperandoRespuestas = true;
        this.debeScroll = true;
        this.cargarConversacion();
      },
      error: () => {
        this.error = 'Error al enviar el mensaje';
        this.enviando = false;
      }
    });
  }

  seleccionarMejor(mensajeId: number, respuestaId: number) {
    this.mensajeService.seleccionarMejorRespuesta(mensajeId, respuestaId).subscribe(() => {
      this.cargarConversacion();
    });
  }

  nombresIA: Record<string, { label: string; color: string; emoji: string }> = {
    GROQ_LLAMA3_3_70B:       { label: 'Llama 3.3 70B',     color: '#f97316', emoji: '🦙' },
    COHERE_COMMAND_R_PLUS:    { label: 'Command R+',        color: '#06b6d4', emoji: '🪸' },
    MISTRAL_SMALL_3:          { label: 'Mistral Small 3',   color: '#a855f7', emoji: '🌬️' },
    GEMINI_2_5_FLASH:        { label: 'Gemini 2.5 Flash',  color: '#facc15', emoji: '✨' },
    NVIDIA_LLAMA_3_3_70B:    { label: 'Llama 3.3 70B',     color: '#76b900', emoji: '🔷' },
    NVIDIA_NEMOTRON_3_SUPER: { label: 'Nemotron 3 Super',  color: '#00e5ff', emoji: '🔷' },
    OPENROUTER_XAI_GROK_IMG:     { label: 'Grok Image',     color: '#1a1a1a', emoji: '🖼️' },
    OPENROUTER_RECRAFT_V3_IMG:   { label: 'Recraft v3',     color: '#f43f5e', emoji: '🎨' },
    OPENROUTER_WAN_2_6_VIDEO:      { label: 'Wan 2.6',        color: '#f59e0b', emoji: '🎬' },
    OPENROUTER_VEO_3_1_LITE_VIDEO: { label: 'Veo 3.1 Lite',   color: '#ef4444', emoji: '🎬' },
    OPENROUTER_XAI_GROK_VIDEO:    { label: 'Grok Video',     color: '#1a1a1a', emoji: '🎬' },
  };

  getIA(key: string) {
    return this.nombresIA[key] || { label: key, color: '#888', emoji: '🤖' };
  }

  iasPendientes(mensaje: Mensaje): string[] {
    const iaEsp = mensaje.tipoContenido === 'IMAGEN' ? IA_ESPERADAS_IMAGEN :
                   mensaje.tipoContenido === 'VIDEO' ? IA_ESPERADAS_VIDEO : IA_ESPERADAS_TEXTO;
    const recibidas = new Set((mensaje.respuestasIA || []).map(r => r.modeloIA));
    return iaEsp.filter(ia => !recibidas.has(ia));
  }

  scrollAbajo() {
    try {
      const el = this.mensajesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  trackById(i: number, item: { id: number }) { return item.id; }

  volver() { this.router.navigate(['/conversaciones']); }

  isImagen(url?: string): boolean {
    return !!url && (url.startsWith('http') || url.startsWith('data:'));
  }
}
