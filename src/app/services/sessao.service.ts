import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class SessaoService {
  private get storage(): Storage | undefined {
    return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
  }
  get accessToken() {
    return this.storage?.getItem('nw-access') ?? null;
  }
  get refreshToken() {
    return this.storage?.getItem('nw-refresh') ?? null;
  }
  get preToken() {
    return this.storage?.getItem('nw-pre') ?? null;
  }
  get configurar() {
    return this.storage?.getItem('nw-configurar') === 'true';
  }
  desafio(token: string, configurar: boolean) {
    this.limpar();
    this.storage?.setItem('nw-pre', token);
    this.storage?.setItem('nw-configurar', String(configurar));
  }
  salvar(tokens: { accessToken: string; refreshToken: string }) {
    this.storage?.setItem('nw-access', tokens.accessToken);
    this.storage?.setItem('nw-refresh', tokens.refreshToken);
    this.storage?.removeItem('nw-pre');
    this.storage?.removeItem('nw-configurar');
  }
  limpar() {
    for (const key of ['nw-access', 'nw-refresh', 'nw-pre', 'nw-configurar'])
      this.storage?.removeItem(key);
  }
}
