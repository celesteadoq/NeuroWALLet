import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Banco } from './banco';

describe('Banco', () => {
  let component: Banco;
  let fixture: ComponentFixture<Banco>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Banco],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Banco);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('abre a seleção das instituições a partir de um único botão', () => {
    TestBed.inject(HttpTestingController).expectOne('/api/openfinance/ambiente').flush({demonstracao:true});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    const button = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((b: unknown) => (b as HTMLButtonElement).textContent?.includes('Conectar banco')) as HTMLButtonElement;
    button.click();fixture.detectChanges();
    const dialog=fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.textContent).toContain('Banco Aurora');
    expect(dialog.textContent).toContain('Banco Horizonte');
  });
});
