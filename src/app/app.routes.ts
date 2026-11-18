import { Routes } from '@angular/router';

export const routes: Routes = [

  {
      path:'login',
      loadComponent:() =>
          import('./pages/login/login')
          .then((m) => m.Login)
  },

  {
      path:'cadastro',
      loadComponent:() =>
          import('./pages/cadastro/cadastro')
          .then((m) => m.Cadastro)

  },

  {
    path:'verificacao-2-fatores-l',
    loadComponent:() =>
        import('./pages/verificacao-2-fatores-l/verificacao-2-fatores-l')
        .then((m) => m.Verificacao2FatoresL)
  },

  {
    path:'verificacao-2-fatores-c',
    loadComponent:() =>
        import('./pages/verificacao-2-fatores-c/verificacao-2-fatores-c')
        .then((m) => m.Verificacao2FatoresC)
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
      path: '**',
      redirectTo: 'login'
    }


];

