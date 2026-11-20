import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodigoVerificacao } from './codigo-verificacao';

describe('CodigoVerificacao', () => {
  let component: CodigoVerificacao;
  let fixture: ComponentFixture<CodigoVerificacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodigoVerificacao],
    }).compileComponents();

    fixture = TestBed.createComponent(CodigoVerificacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 6 inputs', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(6);
  });
});
