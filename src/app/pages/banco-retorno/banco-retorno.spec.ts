import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER } from 'rxjs';
import { BancoService } from '../../services/banco.service';
import { BancoRetorno } from './banco-retorno';

describe('BancoRetorno', () => {
  let component: BancoRetorno;
  let fixture: ComponentFixture<BancoRetorno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BancoRetorno],
      providers: [
        provideRouter([]),
        // serviço falso que nunca responde: o teste não depende de timers nem de navegação
        { provide: BancoService, useValue: { concluirConexao: () => NEVER } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BancoRetorno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
