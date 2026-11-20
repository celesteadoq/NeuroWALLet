import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API } from './core/config';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      // A ordem importa: o apiInterceptor enxerga as respostas e os erros que o mock devolve.
      withInterceptors(API.usarMock ? [apiInterceptor, mockApiInterceptor] : [apiInterceptor]),
    ),
  ],
};
