import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
