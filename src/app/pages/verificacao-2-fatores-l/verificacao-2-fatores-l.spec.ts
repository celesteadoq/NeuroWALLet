import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Verificacao2FatoresL } from './verificacao-2-fatores-l';

describe('Verificacao2FatoresL', () => {
  let component: Verificacao2FatoresL;
  let fixture: ComponentFixture<Verificacao2FatoresL>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verificacao2FatoresL],
    }).compileComponents();

    fixture = TestBed.createComponent(Verificacao2FatoresL);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
