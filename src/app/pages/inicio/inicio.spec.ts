import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Inicio } from './inicio';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pede confirmação e permite escolher apagar o histórico do banco', async () => {
    const painel=component as unknown as {
      aba:import('@angular/core').WritableSignal<string>;
      contas:import('@angular/core').WritableSignal<import('../../services/banco.service').Conta[]>;
    };
    painel.aba.set('contas');painel.contas.set([{id:123,instituicao:'Banco teste',ativa:true}]);
    fixture.detectChanges();
    const abrir=Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((b:unknown)=>(b as HTMLButtonElement).textContent?.includes('Remover conexão')) as HTMLButtonElement;
    abrir.click();fixture.detectChanges();
    const modal=fixture.nativeElement.querySelector('.remove-bank-dialog') as HTMLElement;
    expect(modal.textContent).toContain('Desconectar e manter histórico');
    expect(modal.textContent).toContain('Remover também o histórico');
    modal.querySelectorAll<HTMLInputElement>('input[type="radio"]')[1].click();
    await fixture.whenStable();fixture.detectChanges();
    modal.querySelector<HTMLButtonElement>('.confirm-remove')!.click();
    const request=TestBed.inject(HttpTestingController).expectOne('/api/contas/123?apagarHistorico=true');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.remove-bank-dialog')).toBeNull();
  });

  it('filtra os alertas por estabelecimento e apresenta os valores reais', () => {
    const painel=component as unknown as {
      aba:import('@angular/core').WritableSignal<string>;
      alertas:import('@angular/core').WritableSignal<import('../../services/painel.service').Alerta[]>;
      buscaAlerta:import('@angular/core').WritableSignal<string>;
      alertasFiltrados(): unknown[];
    };
    painel.aba.set('alertas');
    painel.alertas.set([
      {id:1,mensagem:'Compras observadas',projecao:120,criadoEm:new Date().toISOString(),estabelecimento:'Shopee',compras:3,observado:30,inicio:'2026-11-01',fim:'2026-11-07'},
      {id:2,mensagem:'Compras observadas',projecao:200,criadoEm:new Date().toISOString(),estabelecimento:'Shein',compras:4,observado:50,inicio:'2026-11-01',fim:'2026-11-07'},
    ]);
    painel.buscaAlerta.set('shopee');fixture.detectChanges();
    expect(painel.alertasFiltrados().length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.alert-entry').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Total observado');
    expect(fixture.nativeElement.textContent).toContain('Shopee');
  });

  it('distingue a sequência atual dos dias antigos do histórico', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-11-20T15:00:00Z'));
      const painel = component as unknown as {dias: import('@angular/core').WritableSignal<string[]>; sequencia(): number};
      painel.dias.set(['2026-11-19','2026-11-18','2026-11-17','2026-11-16','2026-11-15','2026-11-14','2026-11-13','2026-11-12','2026-11-11']);
      expect(painel.sequencia()).toBe(9);
      painel.dias.set(['2026-11-15','2026-11-14']);
      expect(painel.sequencia()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
