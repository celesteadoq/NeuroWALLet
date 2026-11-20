import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { SessaoService } from './sessao.service';
import { apiInterceptor } from '../core/interceptors/api.interceptor';
import { HttpClient } from '@angular/common/http';
describe('Contratos da API real', () => {
  let auth: AuthService, http: HttpTestingController, sessao: SessaoService;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    sessao = TestBed.inject(SessaoService);
  });
  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });
  it('envia consentimento e aceita cadastro sem corpo', () => {
    let ok = false;
    auth
      .cadastrar({
        nome: 'Maria',
        email: 'm@example.com',
        senha: 'senha longa teste',
        consentimentoLgpd: true,
      })
      .subscribe(() => (ok = true));
    const r = http.expectOne('/api/auth/cadastro');
    expect(r.request.body.consentimentoLgpd).toBe(true);
    r.flush(null, { status: 202, statusText: 'Accepted' });
    expect(ok).toBe(true);
  });
  it('configura TOTP com token temporário e salva os tokens finais', () => {
    auth
      .login({ email: 'm@example.com', senha: 'senha longa teste', lembrar: false })
      .subscribe((r) => expect(r.proximo).toBe('ativar-2fa'));
    http.expectOne('/api/auth/login').flush({ tokenPre2fa: 'temporario', configurarTotp: true });
    auth.iniciar2fa().subscribe((r) => expect(r.chave).toBe('segredo'));
    const ativar = http.expectOne('/api/auth/2fa/ativar');
    expect(ativar.request.headers.get('Authorization')).toBe('Bearer temporario');
    ativar.flush({ segredo: 'segredo', qrPngBase64: 'imagem' });
    auth.verificar2fa('012345').subscribe();
    const confirmar = http.expectOne('/api/auth/2fa/confirmar');
    expect(confirmar.request.body.codigo).toBe('012345');
    confirmar.flush({
      accessToken: 'acesso',
      refreshToken: 'refresh',
      codigosRecuperacao: ['reserva'],
    });
    expect(sessao.accessToken).toBe('acesso');
    expect(sessao.preToken).toBe(null);
  });
  it('compartilha a renovação entre chamadas concorrentes e repete com novo Bearer', () => {
    sessao.salvar({ accessToken: 'antigo', refreshToken: 'refresh' });
    const cliente = TestBed.inject(HttpClient);
    cliente.get('/api/contas').subscribe();
    cliente.get('/api/alertas').subscribe();
    const a = http.expectOne('/api/contas'),
      b = http.expectOne('/api/alertas');
    a.flush(null, { status: 401, statusText: 'Unauthorized' });
    b.flush(null, { status: 401, statusText: 'Unauthorized' });
    const refresh = http.expectOne('/api/auth/refresh');
    expect(refresh.request.body.refreshToken).toBe('refresh');
    refresh.flush({ accessToken: 'novo', refreshToken: 'rotacionado' });
    for (const rota of ['/api/contas', '/api/alertas']) {
      const r = http.expectOne(rota);
      expect(r.request.headers.get('Authorization')).toBe('Bearer novo');
      r.flush([]);
    }
    expect(sessao.refreshToken).toBe('rotacionado');
  });
  it('consulta perfil autenticado e revoga refresh no logout', () => {
    sessao.salvar({ accessToken: 'acesso', refreshToken: 'refresh' });
    auth.sessao().subscribe((r) => expect(r.autenticado).toBe(true));
    const r = http.expectOne('/api/usuario/me');
    expect(r.request.headers.get('Authorization')).toBe('Bearer acesso');
    r.flush({ id: 1, papel: 'CLIENTE' });
    auth.sair().subscribe();
    const sair = http.expectOne('/api/auth/logout');
    expect(sair.request.body.refreshToken).toBe('refresh');
    sair.flush(null, { status: 204, statusText: 'No Content' });
    expect(sessao.accessToken).toBe(null);
  });
});
