import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('permite tentar novamente após senha incorreta e evita duplicação', () => {
    component['form'].patchValue({ email: 'teste@example.invalid', senha: 'incorreta' });
    component['entrar']();
    component['entrar']();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(component['enviando']()).toBe(false);
    expect(component['erro']()).toContain('incorretos');
    component['entrar']();
    http.expectOne('/api/auth/login').flush(null, { status: 429, statusText: 'Too Many Requests' });
    expect(component['enviando']()).toBe(false);
    expect(component['erro']()).toContain('Muitas tentativas');
    http.verify();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component['form'].invalid).toBe(true);
  });

  it('should be valid with e-mail and password', () => {
    component['form'].patchValue({ email: 'a@b.com', senha: '123456' });
    expect(component['form'].valid).toBe(true);
  });
});
