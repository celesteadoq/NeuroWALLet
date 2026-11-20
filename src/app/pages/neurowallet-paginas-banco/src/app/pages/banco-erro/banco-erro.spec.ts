import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BancoErro } from './banco-erro';

describe('BancoErro', () => {
  let component: BancoErro;
  let fixture: ComponentFixture<BancoErro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BancoErro],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BancoErro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
