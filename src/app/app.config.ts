import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(pt);
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
  ],
};
