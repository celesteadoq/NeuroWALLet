import { TestBed } from '@angular/core/testing';
import { SessaoService } from './sessao.service';
describe('Persistência da sessão', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  it('restaura a sessão marcada após fechar a aba e preserva a rotação', () => {
    const s = TestBed.inject(SessaoService);
    s.desafio('pre', false, true);
    expect(localStorage.getItem('nw-pre')).toBeNull();
    s.salvar({ accessToken: 'a', refreshToken: 'r' });
    sessionStorage.clear();
    const restaurada = new SessaoService();
    expect(restaurada.refreshToken).toBe('r');
    restaurada.salvar({ accessToken: 'b', refreshToken: 'r2' });
    expect(localStorage.getItem('nw-refresh')).toBe('r2');
    restaurada.limpar();
    expect(localStorage.getItem('nw-refresh')).toBeNull();
  });
  it('mantém sessão desmarcada somente na aba', () => {
    const s = TestBed.inject(SessaoService);
    s.desafio('pre', false, false);
    s.salvar({ accessToken: 'a', refreshToken: 'r' });
    expect(localStorage.getItem('nw-refresh')).toBeNull();
    sessionStorage.clear();
    expect(new SessaoService().refreshToken).toBeNull();
  });
  it('remove sessão persistente anterior ao iniciar outro login sem marcar', () => {
    const s = TestBed.inject(SessaoService);
    s.desafio('pre', false, true);
    s.salvar({ accessToken: 'a', refreshToken: 'r' });
    s.desafio('outro', false, false);
    s.salvar({ accessToken: 'b', refreshToken: 'r2' });
    expect(localStorage.getItem('nw-refresh')).toBeNull();
    expect(sessionStorage.getItem('nw-refresh')).toBe('r2');
  });
});
