import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/auth/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'verificar',
    loadComponent: () => import('./components/auth/verificar-codigo/verificar-codigo.component').then(m => m.VerificarCodigoComponent)
  },
  {
    path: 'oauth2/callback',
    loadComponent: () => import('./components/auth/oauth2-callback/oauth2-callback.component').then(m => m.OAuth2CallbackComponent)
  },
  {
    path: 'terminos',
    loadComponent: () => import('./components/terminos/terminos.component').then(m => m.TerminosComponent)
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./components/privacidad/privacidad.component').then(m => m.PrivacidadComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: 'chat' }
];
