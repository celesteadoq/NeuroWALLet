import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Banco } from './banco';

describe('Banco', () => {
  let component: Banco;
  let fixture: ComponentFixture<Banco>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Banco],
    }).compileComponents();

    fixture = TestBed.createComponent(Banco);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
