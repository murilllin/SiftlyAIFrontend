import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  template: `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:var(--bg-primary); color:var(--color-text);">
      <img src="https://i.imgur.com/0jeqOIS.png" alt="SiftlyAI" style="width:64px;height:64px;border-radius:16px;object-fit:cover;margin-bottom:24px;box-shadow:0 0 30px rgba(0,82,255,0.3);">
      <h2 style="font-family:'Hanken Grotesk',sans-serif; font-size:1.5rem; margin-bottom:8px;">Sincronizando con Google...</h2>
      <p style="color:var(--color-text-secondary);">Espera un momento, por favor.</p>
      <div style="margin-top:20px; display:flex; gap:5px;">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--color-primary);animation:bounce 1.2s infinite ease-in-out;"></span>
        <span style="width:8px;height:8px;border-radius:50%;background:var(--color-primary);animation:bounce 1.2s infinite ease-in-out;animation-delay:.2s;"></span>
        <span style="width:8px;height:8px;border-radius:50%;background:var(--color-primary);animation:bounce 1.2s infinite ease-in-out;animation-delay:.4s;"></span>
      </div>
    </div>
  `
})
export class OAuth2CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute, 
    private auth: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('DEBUG [CallbackComponent]: Parámetros de URL recibidos:', params);

      if (params['token']) {
        this.auth.procesarCallbackOAuth2(params);
        console.log('DEBUG [CallbackComponent]: Sesión guardada. Saltando al chat...');
        this.router.navigate(['/chat'], { replaceUrl: true });
      } else {
        console.error('DEBUG [CallbackComponent]: No se recibió token del backend.');
        this.router.navigate(['/login']);
      }
    });
  }
}
