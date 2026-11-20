import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class SessaoService {
  private get temporario(): Storage | undefined {
    return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
  }
  private get persistente(): Storage | undefined {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  }
  private get storage() {
    return this.temporario?.getItem('nw-persistir') === 'true' ||
      this.persistente?.getItem('nw-refresh')
      ? this.persistente
      : this.temporario;
  }
  get accessToken() {
    return this.storage?.getItem('nw-access') ?? null;
  }
  get refreshToken() {
    return this.storage?.getItem('nw-refresh') ?? null;
  }
  get preToken() {
    return this.temporario?.getItem('nw-pre') ?? null;
  }
  get configurar() {
    return this.temporario?.getItem('nw-configurar') === 'true';
  }
  desafio(token: string, configurar: boolean, lembrar = false) {
    this.limpar();
    this.temporario?.setItem('nw-pre', token);
    this.temporario?.setItem('nw-configurar', String(configurar));
    this.temporario?.setItem('nw-persistir', String(lembrar));
  }
  salvar(tokens: { accessToken: string; refreshToken: string }) {
    const destino = this.storage;
    destino?.setItem('nw-access', tokens.accessToken);
    destino?.setItem('nw-refresh', tokens.refreshToken);
    this.temporario?.removeItem('nw-pre');
    this.temporario?.removeItem('nw-configurar');
  }
  limpar() {
    for (const armazenamento of [this.temporario, this.persistente])
      for (const key of ['nw-access', 'nw-refresh', 'nw-pre', 'nw-configurar', 'nw-persistir'])
        armazenamento?.removeItem(key);
  }
}
