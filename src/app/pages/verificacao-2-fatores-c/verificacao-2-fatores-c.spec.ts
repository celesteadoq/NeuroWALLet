import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Verificacao2FatoresC } from './verificacao-2-fatores-c';

describe('Verificacao2FatoresC', () => {
  let component: Verificacao2FatoresC;
  let fixture: ComponentFixture<Verificacao2FatoresC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verificacao2FatoresC],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Verificacao2FatoresC);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
