import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { marked } from 'marked';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ThemeToggleComponent } from '../shared/theme-toggle/theme-toggle.component';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ConversacionService } from '../../services/conversacion.service';
import { MensajeService } from '../../services/mensaje.service';
import { Conversacion } from '../../models/conversacion.model';
import { Mensaje } from '../../models/mensaje.model';

import { AudioPlayerComponent } from './audio-player.component';

const API = 'https://gpcueb.org/siftlyai';

const IA_ESPERADAS_TEXTO = [
  'GROQ_LLAMA3',
  'COHERE_COMMAND',
  'MISTRAL_SMALL',
  'GEMINI',
  'NVIDIA_LLAMA_3_3_70B',
  'NVIDIA_NEMOTRON_3_SUPER'
];

const IA_ESPERADAS_IMAGEN = [
  'POLLINATIONS_IMG',
  'OPENROUTER_XAI_GROK_IMG',
  'OPENROUTER_RECRAFT_IMG'
];

const IA_ESPERADAS_VIDEO = [
  'OPENROUTER_WAN_VIDEO',
  'OPENROUTER_VEO_LITE_VIDEO',
  'OPENROUTER_XAI_GROK_VIDEO'
];

const IA_AUDIO_TTS = 'GROQ_TTS_ORPHEUS';

export interface IAMeta {
  label: string;
  color: string;
  bg: string;
  iconPath: string;
  empresa: string;
  categoria: 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'AUDIO';
}

export const IA_META: Record<string, IAMeta> = {
  
  GROQ_LLAMA3: {
    label: 'Llama 3',
    empresa: 'Groq',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.10)',
    iconPath: '🦙',
    categoria: 'TEXTO'
  },
  COHERE_COMMAND: {
    label: 'Command',
    empresa: 'Cohere',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.10)',
    iconPath: '🪸',
    categoria: 'TEXTO'
  },
  MISTRAL_SMALL: {
    label: 'Mistral',
    empresa: 'Mistral',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.10)',
    iconPath: '🌬️',
    categoria: 'TEXTO'
  },
  GEMINI: {
    label: 'Gemini',
    empresa: 'Google',
    color: '#facc15',
    bg: 'rgba(250,204,21,0.10)',
    iconPath: '✨',
    categoria: 'TEXTO'
  },
  NVIDIA_LLAMA_3_3_70B: {
    label: 'Llama 3.3 70B',
    empresa: 'NVIDIA NIM',
    color: '#76b900',
    bg: 'rgba(118,185,0,0.10)',
    iconPath: '🔷',
    categoria: 'TEXTO'
  },
  NVIDIA_NEMOTRON_3_SUPER: {
    label: 'Nemotron 3 Super',
    empresa: 'NVIDIA NIM',
    color: '#00e5ff',
    bg: 'rgba(0,229,255,0.10)',
    iconPath: '🔷',
    categoria: 'TEXTO'
  },
  
  POLLINATIONS_IMG: {
    label: 'Pollinations',
    empresa: 'Pollinations',
    color: '#00b4d8',
    bg: 'rgba(0,180,216,0.10)',
    iconPath: '🌸',
    categoria: 'IMAGEN'
  },
  OPENROUTER_XAI_GROK_IMG: {
    label: 'Grok Image',
    empresa: 'xAI',
    color: '#e2e2e9',
    bg: 'rgba(226,226,233,0.10)',
    iconPath: '🎨',
    categoria: 'IMAGEN'
  },
  OPENROUTER_RECRAFT_IMG: {
    label: 'Recraft',
    empresa: 'Recraft',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.10)',
    iconPath: '🎨',
    categoria: 'IMAGEN'
  },
  
  OPENROUTER_WAN_VIDEO: {
    label: 'Wan 2.6',
    empresa: 'Alibaba',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
    iconPath: '🎬',
    categoria: 'VIDEO'
  },
  OPENROUTER_VEO_LITE_VIDEO: {
    label: 'Veo Lite',
    empresa: 'Google',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.10)',
    iconPath: '🎬',
    categoria: 'VIDEO'
  },
  OPENROUTER_XAI_GROK_VIDEO: {
    label: 'Grok Video',
    empresa: 'xAI',
    color: '#e2e2e9',
    bg: 'rgba(226,226,233,0.10)',
    iconPath: '🎬',
    categoria: 'VIDEO'
  },
  
  GROQ_TTS_ORPHEUS: {
    label: 'Orpheus TTS',
    empresa: 'Groq',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.10)',
    iconPath: '🎤',
    categoria: 'AUDIO'
  },
};

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeToggleComponent, AudioPlayerComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('inputRef') inputRef!: ElementRef;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversaciones: Conversacion[] = [];
  sidebarOpen = true;
  sidebarSeccion: 'chats' | 'models' | 'docs' | 'settings' = 'chats';

  conversacionActualId: number | null = null;
  mensajes: Mensaje[] = [];
  titulo = '';

  prompt = '';
  tipoContenido: 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'AUDIO_TTS' = 'TEXTO';
  enviando = false;
  esperando = false;

  audioResultUrl: string | null = null;
  mediaLoading = false;
  mediaError = '';

  cargando = false;
  error = '';
  private debeScroll = false;
  private scrollInstantaneo = false;
  private pollSub?: Subscription;
  private pendientes = new Set<number>();
  private esperandoMejor = false;          
  private esperandoMejorTicks = 0;         

  perfilOpen = false;
  perfilNombre = '';
  perfilApellido = '';
  perfilEmail = '';
  perfilPass = '';
  perfilError = '';
  perfilOk = false;
  perfilGuardando = false;

  constructor(
    public auth: AuthService,
    private convService: ConversacionService,
    private mensajeService: MensajeService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer
  ) {
    
    marked.setOptions({ breaks: true, gfm: true });
  }

  ngOnInit() {
    if (this.auth.usuario) { this.cargarSidebar(); }
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.abrirConversacion(+id);
      } else {
        this.conversacionActualId = null;
        this.mensajes = [];
        this.titulo = '';
        this.cargando = false;
        this.error = '';
        if (this.auth.usuario && this.conversaciones.length === 0) this.cargarSidebar();
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }
  ngAfterViewChecked() {
    if (this.debeScroll) {
      const instante = this.scrollInstantaneo;
      this.debeScroll = false;
      this.scrollInstantaneo = false;
      this.scrollAbajo(instante);
    }
  }

  cargarSidebar() {
    const uid = this.auth.usuario!.id;
    this.convService.obtenerConversaciones(uid).subscribe({
      next: convs => { this.conversaciones = convs; this.cdr.detectChanges(); },
      error: err => console.error('Error sidebar:', err)
    });
  }

  abrirConversacion(id: number) {
    const isInitialLoad = this.conversacionActualId !== id;
    if (isInitialLoad) { this.cargando = true; this.error = ''; }
    this.conversacionActualId = id;
    this.cdr.detectChanges();
    this.convService.obtenerConversacion(id).subscribe({
      next: data => {
        this.titulo = data.titulo;
        const nuevos: Mensaje[] = data.mensajes || [];
        this.mensajes = nuevos.map(m => {
          const tieneAudio = (m.respuestasIA || []).some((r: any) => r.modeloIA === 'GROQ_TTS_ORPHEUS');
          if (tieneAudio && m.tipoContenido !== 'AUDIO_TTS') {
            return { ...m, tipoContenido: 'AUDIO_TTS' as any };
          }
          return m;
        });
        this.cargando = false;
        this.verificarPendientes();
        if (isInitialLoad) {
          this.debeScroll = true;
          this.scrollInstantaneo = true;
          
          setTimeout(() => {
            try {
              this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
            } catch {}
          }, 50);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarConv(id: number) { this.router.navigate(['/chat', id]); }

  cerrarSidebarMobile() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  nuevaConversacion() {
    this.router.navigate(['/chat']);
    this.conversacionActualId = null;
    this.mensajes = [];
    this.titulo = '';
    this.cargando = false;
    this.error = '';
    this.pendientes.clear();
    this.esperando = false;
    this.esperandoMejor = false;
    this.esperandoMejorTicks = 0;
    this.audioResultUrl = null;
    this.mediaError = '';
    this.cdr.detectChanges();
  }

  eliminarConv(e: Event, id: number) {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta conversación?')) return;
    this.convService.eliminarConversacion(id).subscribe(() => {
      this.cargarSidebar();
      if (this.conversacionActualId === id) this.nuevaConversacion();
    });
  }

  async enviar() {
    if (this.tipoContenido === 'AUDIO_TTS') { this.enviarTTS(); return; }
    const texto = this.prompt.trim();
    if (!texto || this.enviando) return;
    this.enviando = true;
    this.error = '';
    this.cdr.detectChanges();
    const tipoIA = this.tipoContenido as 'TEXTO' | 'IMAGEN' | 'VIDEO';
    if (!this.conversacionActualId) {
      const titulo = texto.length > 40 ? texto.substring(0, 40) + '...' : texto;
      this.convService.crearConversacion(titulo, this.auth.usuario!.id).subscribe({
        next: (nueva: Conversacion) => {
          this.conversacionActualId = nueva.id;
          this.titulo = nueva.titulo;
          this.conversaciones = [nueva, ...this.conversaciones];
          this.enviarMensajeAConversacion(nueva.id, texto, tipoIA);
          this.location.replaceState('/chat/' + nueva.id);
          this.cargarSidebar();
        },
        error: () => { this.error = 'Error al crear conversación'; this.enviando = false; this.cdr.detectChanges(); }
      });
    } else {
      this.enviarMensajeAConversacion(this.conversacionActualId, texto, tipoIA);
    }
  }

  private enviarMensajeAConversacion(convId: number, texto: string, tipo: 'TEXTO' | 'IMAGEN' | 'VIDEO') {
    const msgOptimista: Mensaje = {
      id: Date.now(), conversacionId: convId, tipo: 'USUARIO',
      contenido: texto, tipoContenido: tipo,
      fechaCreacion: new Date().toISOString(), respuestasIA: []
    };
    this.mensajes = [...this.mensajes, msgOptimista];
    this.prompt = '';
    this.debeScroll = true;
    this.esperando = true;
    this.esperandoMejor = true;
    this.esperandoMejorTicks = 30;
    this.iniciarPolling();
    this.cdr.detectChanges();
    this.mensajeService.enviarMensaje(convId, texto, tipo).subscribe({
      next: () => { this.enviando = false; this.cdr.detectChanges(); setTimeout(() => this.recargar(), 300); },
      error: () => {
        this.error = 'Error al enviar el mensaje';
        this.enviando = false;
        this.mensajes = this.mensajes.filter(m => m.id !== msgOptimista.id);
        this.cdr.detectChanges();
      }
    });
  }

  enviarTTS() {
    const texto = this.prompt.trim();
    if (!texto || this.enviando) return;
    this.enviando = true;
    this.error = '';
    this.cdr.detectChanges();

    const doEnvio = (convId: number) => {
      const tmpId = Date.now();
      const msgOptimista: Mensaje = {
        id: tmpId, conversacionId: convId, tipo: 'USUARIO',
        contenido: texto, tipoContenido: 'AUDIO_TTS',
        fechaCreacion: new Date().toISOString(), respuestasIA: []
      };
      this.mensajes = [...this.mensajes, msgOptimista];
      this.prompt = '';
      this.debeScroll = true;
      this.pollSub?.unsubscribe();
      this.esperando = false;
      this.esperandoMejor = false;
      this.cdr.detectChanges();

      this.mensajeService.enviarMensaje(convId, texto, 'AUDIO_TTS').toPromise()
        .then((mensajeGuardado: any) => {
          const mensajeId: number = mensajeGuardado?.mensajeId ?? tmpId;

          this.mensajes = this.mensajes.map(m =>
            m.id === tmpId ? { ...m, id: mensajeId } : m
          );

          const t0 = Date.now();

          return this.http.post(`${API}/media/tts`, { texto, mensajeId }, { responseType: 'blob' })
            .toPromise()
            .then((blob: any) => {
              const audioUrl = URL.createObjectURL(blob);
              const ms = Date.now() - t0;

              const respSintetica: any = {
                id: Date.now(),
                mensajeId,
                modeloIA: 'GROQ_TTS_ORPHEUS',
                nombreModelo: 'Orpheus TTS',
                respuesta: '',
                tiempoRespuestaMs: ms,
                esMejorRespuesta: false,
                fechaCreacion: new Date().toISOString(),
                urlArchivo: audioUrl,
                esAudio: true
              };

              this.mensajes = this.mensajes.map(m =>
                m.id === mensajeId
                  ? { ...m, tipoContenido: 'AUDIO_TTS' as any, respuestasIA: [respSintetica] }
                  : m
              );

              this.esperando = false;
              this.enviando = false;
              this.debeScroll = true;
              this.cdr.detectChanges();
            });
        })
        .catch(() => {
          this.error = 'Error generando audio. Verifica la configuración de Groq TTS.';
          this.esperando = false;
          this.enviando = false;
          this.mensajes = this.mensajes.filter(m => m.id !== tmpId);
          this.cdr.detectChanges();
        });
    };

    if (!this.conversacionActualId) {
      const titulo = texto.length > 40 ? texto.substring(0, 40) + '...' : texto;
      this.convService.crearConversacion(titulo, this.auth.usuario!.id).subscribe({
        next: (nueva: Conversacion) => {
          this.conversacionActualId = nueva.id;
          this.titulo = nueva.titulo;
          this.conversaciones = [nueva, ...this.conversaciones];
          this.location.replaceState('/chat/' + nueva.id);
          this.cargarSidebar();
          doEnvio(nueva.id);
        },
        error: () => { this.error = 'Error al crear conversación'; this.enviando = false; this.cdr.detectChanges(); }
      });
    } else {
      doEnvio(this.conversacionActualId);
    }
  }

  getPlaceholder(): string {
    switch (this.tipoContenido) {
      case 'IMAGEN':    return 'Describe la imagen que quieres generar...';
      case 'VIDEO':     return 'Describe el video que quieres generar...';
      case 'AUDIO_TTS': return 'Escribe el texto para convertir a voz...';
      default:          return 'Escribe tu mensaje...';
    }
  }

  iniciarPolling() {
    if (this.pollSub && !this.pollSub.closed) return;
    this.pollSub = interval(2000).subscribe(() => {
      const hayPendiente = this.pendientes.size > 0 || this.esperando || this.esperandoMejor;
      if (!hayPendiente || !this.conversacionActualId) return;

      this.recargar();
      if (this.esperandoMejor) {
        this.esperandoMejorTicks--;
        if (this.esperandoMejorTicks <= 0) {
          this.esperandoMejor = false;
          if (this.pendientes.size === 0 && !this.esperando) {
            this.pollSub?.unsubscribe();
          }
        }
      }
    });
  }

  recargar() {
    if (!this.conversacionActualId) return;
    this.convService.obtenerConversacion(this.conversacionActualId).subscribe({
      next: data => {
        const oldLength = this.mensajes.length;
        const oldPend = this.pendientes.size;
        const nuevos: Mensaje[] = data.mensajes || [];
        const mejorCambio = this.esperandoMejor && JSON.stringify(
          nuevos.map((m: any) => (m.respuestasIA || []).map((r: any) => r.esMejorRespuesta))
        ) !== JSON.stringify(
          this.mensajes.map(m => (m.respuestasIA || []).map(r => r.esMejorRespuesta))
        );
        const usuariosActuales = this.mensajes.filter(m => m.tipo === 'USUARIO').length;
        const usuariosNuevos = nuevos.filter((m: any) => m.tipo === 'USUARIO').length;
        if (usuariosNuevos >= usuariosActuales) {
          this.mensajes = nuevos.map(m => {
            const tieneAudio = (m.respuestasIA || []).some((r: any) => r.modeloIA === 'GROQ_TTS_ORPHEUS');
            if (tieneAudio && m.tipoContenido !== 'AUDIO_TTS') {
              return { ...m, tipoContenido: 'AUDIO_TTS' as any };
            }
            return m;
          });
          this.mensajes = this.aplicarMejorRespuestaFront(this.mensajes);
        }
        this.verificarPendientes();
        if (this.mensajes.length !== oldLength || this.pendientes.size !== oldPend || mejorCambio) {
          this.debeScroll = true;
          this.cdr.detectChanges();
        }
      },
      error: err => console.error('Poll error:', err)
    });
  }

  verificarPendientes() {
    this.pendientes.clear();
    for (const m of this.mensajes) {
      if (m.tipo !== 'USUARIO') continue;
      if ((m.respuestasIA || []).some((r: any) => r.esAudio)) continue;
      const iaEsp = this.getIAsEsperadas(m.tipoContenido);
      if ((m.respuestasIA || []).length < iaEsp.length) this.pendientes.add(m.id);
    }
    if (this.pendientes.size === 0) {
      this.esperando = false;
      if (!this.esperandoMejor) {
        this.pollSub?.unsubscribe();
      }
    }
  }

  getIAsEsperadas(tipo: string): string[] {
    switch (tipo) {
      case 'IMAGEN':    return IA_ESPERADAS_IMAGEN;
      case 'VIDEO':     return IA_ESPERADAS_VIDEO;
      case 'AUDIO_TTS': return [];
      default:          return IA_ESPERADAS_TEXTO;
    }
  }

  getIA(key: string): IAMeta {
    return IA_META[key] || {
      label: key,
      empresa: 'Desconocido',
      color: '#888',
      bg: 'rgba(128,128,128,0.08)',
      iconPath: '❓',
      categoria: 'TEXTO'
    };
  }

  iasPendientes(msg: Mensaje): string[] {
    const iaEsp = this.getIAsEsperadas(msg.tipoContenido);
    const recibidas = new Set((msg.respuestasIA || []).map(r => r.modeloIA));
    return iaEsp.filter(ia => !recibidas.has(ia));
  }

  isPendiente(msgId: number) { return this.pendientes.has(msgId); }

  seleccionarMejor(mensajeId: number, respuestaId: number) {
    this.mensajeService.seleccionarMejorRespuesta(mensajeId, respuestaId).subscribe(() => this.recargar());
  }

private _urlCache = new Map<string, string>();

getProxiedUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const cached = this._urlCache.get(url);
    if (cached) return cached;
    let result = url;
    if (url.includes('openrouter.ai')) {
        if (url.includes('/videos/')) {
            result = `https://gpcueb.org/siftlyai/auth/public/video?url=${encodeURIComponent(url)}`;
        } else if (url.includes('/image') || url.includes('.png') || url.includes('.jpg')) {
            result = `https://gpcueb.org/siftlyai/auth/public/image?url=${encodeURIComponent(url)}`;
        } else {
            result = `https://gpcueb.org/siftlyai/auth/public/video?url=${encodeURIComponent(url)}`;
        }
    } else if (url.includes('pollinations.ai')) {
        result = `https://gpcueb.org/siftlyai/auth/public/image?url=${encodeURIComponent(url)}`;
    }
    this._urlCache.set(url, result);
    return result;
}

  
  private _audioUrlCache = new Map<string, SafeUrl>();

  safeAudioUrl(url: string | undefined): SafeUrl | string {
    if (!url) return '';
    const cached = this._audioUrlCache.get(url);
    if (cached) return cached;

    let blobUrl: string;
    if (url.startsWith('blob:')) {
      blobUrl = url;
    } else if (url.startsWith('data:audio')) {
      try {
        const [header, b64] = url.split(',');
        const mime = header.split(':')[1].split(';')[0];
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });
        blobUrl = URL.createObjectURL(blob);
      } catch {
        blobUrl = url;
      }
    } else {
      return url;
    }

    const safe = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this._audioUrlCache.set(url, safe);
    return safe;
  }

  isAudioUrl(resp?: any): boolean {
    if (!resp) return false;
    if (resp.esAudio) return true;
    if (resp.modeloIA === 'GROQ_TTS_ORPHEUS') return true;
    const url = resp.urlArchivo || '';
    const l = url.toLowerCase();
    if (l.startsWith('data:image') || l.startsWith('data:video')) return false;
    return l.startsWith('data:audio') || l.endsWith('.wav') || l.endsWith('.mp3') ||
           l.endsWith('.ogg') || l.endsWith('.opus');
  }

  isImagenUrl(resp?: any, url?: string): boolean {
    const modelosVideo = ['OPENROUTER_WAN_VIDEO', 'OPENROUTER_VEO_LITE_VIDEO', 'OPENROUTER_XAI_GROK_VIDEO'];
    if (resp && modelosVideo.includes(resp.modeloIA)) return false;

    const u = url || '';
    if (!u) return false;
    const l = u.toLowerCase();
    if (l.startsWith('data:video')) return false;
    if (l.startsWith('data:image')) return true;
    return l.endsWith('.png') || l.endsWith('.jpg') || l.endsWith('.jpeg') ||
           l.endsWith('.gif') || l.endsWith('.webp') || l.includes('image');
  }

  isVideoUrl(resp?: any): boolean {
    if (!resp) return false;

    const modelosVideo = ['OPENROUTER_WAN_VIDEO', 'OPENROUTER_VEO_LITE_VIDEO', 'OPENROUTER_XAI_GROK_VIDEO'];
    if (modelosVideo.includes(resp.modeloIA)) return true;

    const url = resp.urlArchivo || '';
    if (!url) return false;
    const l = url.toLowerCase();
    if (l.startsWith('data:video')) return true;
    if (l.includes('openrouter.ai') && l.includes('/videos/')) return true;
    return l.endsWith('.mp4') || l.endsWith('.webm') || l.endsWith('.mov');
  }

  onEnter(event: Event) {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) return;
    event.preventDefault();
    this.enviar();
  }

  scrollAbajo(instantaneo = false) {
    try {
      const behavior = instantaneo ? 'instant' : 'smooth';
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: behavior as ScrollBehavior });
    } catch {}
  }

  logout() { this.auth.logout(); this.router.navigate(['/login']); }

  formatFecha(f: string) {
    const d = new Date(f);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString())
      return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  trackById(i: number, item: { id: number }) { return item.id; }

  get esAdmin(): boolean { return this.auth.isAdmin; }

  abrirPerfil() {
    this.perfilNombre = this.auth.usuario?.nombre || '';
    this.perfilApellido = this.auth.usuario?.apellido || '';
    this.perfilEmail = this.auth.usuario?.email || '';
    this.perfilPass = '';
    this.perfilError = '';
    this.perfilOk = false;
    this.perfilOpen = true;
  }

  guardarPerfil() {
    if (!this.perfilNombre.trim() || !this.perfilApellido.trim() || !this.perfilEmail.trim()) {
      this.perfilError = 'Nombre, apellido y email son obligatorios';
      return;
    }
    this.perfilGuardando = true;
    this.perfilError = '';
    const body: any = { nombre: this.perfilNombre, apellido: this.perfilApellido, email: this.perfilEmail };
    if (this.perfilPass.trim()) body.password = this.perfilPass;
    this.http.put<any>(`${API}/auth/usuarios/${this.auth.usuario!.id}`, body).subscribe({
      next: u => {
        const updated = { ...this.auth.usuario!, nombre: u.nombre, apellido: u.apellido, email: u.email };
        (this.auth as any)._usuario = updated;
        localStorage.setItem('auth', JSON.stringify({ token: this.auth.token, usuario: updated }));
        this.perfilOk = true;
        this.perfilGuardando = false;
        setTimeout(() => { this.perfilOpen = false; }, 1200);
        this.cdr.detectChanges();
      },
      error: () => { this.perfilError = 'Error al guardar'; this.perfilGuardando = false; }
    });
  }

  descargarPDF(texto: string, modelo: string) {
    const lines = texto.split('\n');
    let html = `<html><head><meta charset="utf-8"><style>body{font-family:'Inter',sans-serif;padding:32px;max-width:700px;margin:0 auto;line-height:1.6;color:#191c20}h1{font-family:'Hanken Grotesk',sans-serif;font-size:1.1rem;color:#0052ff;border-bottom:2px solid #0052ff;padding-bottom:8px}</style></head><body>`;
    html += `<h1>${modelo}</h1>`;
    lines.forEach(l => { html += `<p>${l || '&nbsp;'}</p>`; });
    html += '</body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `respuesta-${modelo}.html`;
    a.click();
  }

  getIAsPorCategoria(cat: 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'AUDIO'): IAMeta[] {
    return Object.values(IA_META).filter(ia => ia.categoria === cat);
  }

  
  private _mdCache = new Map<string, SafeHtml>();

  renderMd(texto: string): SafeHtml {
    if (!texto) return this.sanitizer.bypassSecurityTrustHtml('');
    const cached = this._mdCache.get(texto);
    if (cached) return cached;
    const html = marked.parse(texto) as string;
    const safe = this.sanitizer.bypassSecurityTrustHtml(html);
    this._mdCache.set(texto, safe);
    return safe;
  }

  private aplicarMejorRespuestaFront(mensajes: Mensaje[]): Mensaje[] {
    const candidatosImagen = ['OPENROUTER_XAI_GROK_IMG', 'OPENROUTER_RECRAFT_IMG'];
    const candidatosVideo  = ['OPENROUTER_XAI_GROK_VIDEO', 'OPENROUTER_VEO_LITE_VIDEO'];

    return mensajes.map(m => {
      if (m.tipo !== 'USUARIO') return m;
      if (m.tipoContenido !== 'IMAGEN' && m.tipoContenido !== 'VIDEO') return m;

      const respuestas = m.respuestasIA || [];
      if (respuestas.some(r => r.esMejorRespuesta)) return m;

      const candidatos = m.tipoContenido === 'IMAGEN' ? candidatosImagen : candidatosVideo;
      const candidatasPresentes = candidatos.filter(c =>
        respuestas.some(r => r.modeloIA === c && r.urlArchivo)
      );
      if (candidatasPresentes.length < 2) return m;

      const elegida = candidatasPresentes[m.id % 2];

      const nuevasRespuestas = respuestas.map(r => ({
        ...r,
        esMejorRespuesta: r.modeloIA === elegida
      }));
      return { ...m, respuestasIA: nuevasRespuestas };
    });
  }


}