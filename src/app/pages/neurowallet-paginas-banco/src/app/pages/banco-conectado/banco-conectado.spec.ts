import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BancoConectado } from './banco-conectado';

describe('BancoConectado', () => {
  let component: BancoConectado;
  let fixture: ComponentFixture<BancoConectado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BancoConectado],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BancoConectado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
