import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Verificacao2FatoresL } from './verificacao-2-fatores-l';

describe('Verificacao2FatoresL', () => {
  let component: Verificacao2FatoresL;
  let fixture: ComponentFixture<Verificacao2FatoresL>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verificacao2FatoresL],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Verificacao2FatoresL);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('libera uma nova tentativa depois de código incorreto', () => {
    component['codigo'].set('111111');
    component['verificarCodigo']();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/auth/2fa/verificar')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(component['enviando']()).toBe(false);
    expect(component['expirada']()).toBe(false);
    expect(component['erro']()).toContain('Código incorreto');
    component['codigo'].set('222222');
    component['verificarCodigo']();
    const r = http.expectOne('/api/auth/2fa/verificar');
    expect(r.request.body.codigo).toBe('222222');
    r.flush(null, { status: 401, statusText: 'Unauthorized' });
    http.verify();
  });
  it('informa limite de tentativas sem manter envio travado', () => {
    component['codigo'].set('111111');
    component['verificarCodigo']();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/2fa/verificar')
      .flush(null, { status: 429, statusText: 'Too Many Requests' });
    expect(component['enviando']()).toBe(false);
    expect(component['erro']()).toContain('Muitas tentativas');
  });
  it('não duplica envio e informa sessão expirada', () => {
    component['codigo'].set('111111');
    component['verificarCodigo']();
    component['verificarCodigo']();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/2fa/verificar').flush(null, { status: 403, statusText: 'Forbidden' });
    expect(component['expirada']()).toBe(true);
    expect(component['enviando']()).toBe(false);
    http.verify();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
