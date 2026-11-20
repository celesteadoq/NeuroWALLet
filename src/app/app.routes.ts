import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ---------- entrada e cadastro (sem sessão) ----------
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    path: 'verificacao-2-fatores-c',
    loadComponent: () =>
      import('./pages/verificacao-2-fatores-c/verificacao-2-fatores-c').then(
        (m) => m.Verificacao2FatoresC,
      ),
  },
  {
    path: 'verificacao-2-fatores-c2',
    loadComponent: () =>
      import('./pages/verificacao-2-fatores-c2/verificacao-2-fatores-c2').then(
        (m) => m.Verificacao2FatoresC2,
      ),
  },
  {
    path: 'verificacao-2-fatores-l',
    loadComponent: () =>
      import('./pages/verificacao-2-fatores-l/verificacao-2-fatores-l').then(
        (m) => m.Verificacao2FatoresL,
      ),
  },

  // ---------- área logada (exige sessão) ----------
  {
    path: 'banco',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/banco/banco').then((m) => m.Banco),
  },
  {
    path: 'banco/retorno',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/banco-retorno/banco-retorno').then((m) => m.BancoRetorno),
  },
  {
    path: 'banco/conectado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/banco-conectado/banco-conectado').then((m) => m.BancoConectado),
  },
  {
    path: 'banco/erro',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/banco-erro/banco-erro').then((m) => m.BancoErro),
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },

  // ---------- páginas ainda em construção ----------
  {
    path: 'termos-de-uso',
    data: { titulo: 'Termos de Uso' },
    loadComponent: () => import('./pages/em-construcao/em-construcao').then((m) => m.EmConstrucao),
  },
  {
    path: 'politica-de-privacidade',
    data: { titulo: 'Política de Privacidade' },
    loadComponent: () => import('./pages/em-construcao/em-construcao').then((m) => m.EmConstrucao),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./pages/recuperar-senha/recuperar-senha').then((m) => m.RecuperarSenha),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./pages/recuperar-senha/recuperar-senha').then((m) => m.RecuperarSenha),
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
