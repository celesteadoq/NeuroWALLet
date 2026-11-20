import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
});
