import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SessaoService } from '../../services/sessao.service';
import { Verificacao2FatoresC2 } from './verificacao-2-fatores-c2';

describe('Verificacao2FatoresC2', () => {
  let component: Verificacao2FatoresC2;
  let fixture: ComponentFixture<Verificacao2FatoresC2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verificacao2FatoresC2],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Verificacao2FatoresC2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('só libera a continuação depois de validar o código do autenticador', async () => {
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessaoService).desafio('desafio-local', true);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    http.expectOne('/api/auth/2fa/ativar').flush({segredo:'JBSWY3DPEHPK3PXP',qrPngBase64:null});
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    expect(form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    const inputs = Array.from(form.querySelectorAll('input'));
    inputs.forEach((input, i) => { input.value = String(i + 1); input.dispatchEvent(new Event('input')); });
    fixture.detectChanges();
    form.dispatchEvent(new Event('submit', {cancelable:true}));
    http.expectOne('/api/auth/2fa/confirmar').flush({}, {status:401,statusText:'Unauthorized'});
    fixture.detectChanges();
    expect(navegar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Código incorreto');
    form.dispatchEvent(new Event('submit', {cancelable:true}));
    http.expectOne('/api/auth/2fa/confirmar').flush({accessToken:'acesso',refreshToken:'renovar',codigosRecuperacao:['reserva']});
    fixture.detectChanges();
    expect(navegar).not.toHaveBeenCalled();
    const concluir = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((b: unknown) => (b as HTMLButtonElement).textContent?.includes('Guardei')) as HTMLButtonElement;
    concluir.click();
    expect(navegar).toHaveBeenCalledWith('/inicio');
    TestBed.inject(SessaoService).limpar();
  });
});
