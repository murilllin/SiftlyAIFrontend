import { Component, Input, OnChanges, ElementRef, ViewChild, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `<audio #audioEl controls style="width:100%;margin-bottom:8px"></audio>`
})
export class AudioPlayerComponent implements AfterViewInit, OnChanges {
  @Input() url: string = '';
  @ViewChild('audioEl') audioEl!: ElementRef<HTMLAudioElement>;

  ngAfterViewInit() {
    this.setSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['url'] && this.audioEl) {
      this.setSource();
    }
  }

  private setSource() {
    if (!this.url || !this.audioEl) return;
    // Setear el src directamente en el DOM, evitando el sanitizador de Angular
    const audio = this.audioEl.nativeElement;

    if (this.url.startsWith('data:audio')) {
      // Convertir base64 a blob para reproducción confiable
      try {
        const [header, b64] = this.url.split(',');
        const mime = header.split(':')[1].split(';')[0];
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });
        audio.src = URL.createObjectURL(blob);
      } catch {
        audio.src = this.url;
      }
    } else {
      audio.src = this.url; // blob: URL directo
    }

    audio.load();
  }
}
