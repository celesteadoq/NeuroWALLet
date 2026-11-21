import { Component, afterNextRender, computed, inject, signal, DestroyRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize, timer } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BancoService, Conta } from '../../services/banco.service';
import {
  PainelService,
  Pagina,
  Alerta,
  Fatura,
  SaudeAdministrativa,
  Selo,
  Relatorio,
  Regra,
  Parametros,
  Loja,
  Excecao,
} from '../../services/painel.service';
import { mensagemDeErro } from '../../core/erros';
@Component({
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly banco = inject(BancoService);
  private readonly api = inject(PainelService);
  private readonly destroy = inject(DestroyRef);
  protected readonly aba = signal('inicio');
  protected readonly menuAberto = signal(false);
  protected readonly aviso = signal('');
  protected readonly tipoAviso = signal<'info' | 'sucesso' | 'erro' | 'alerta'>('info');
  protected readonly mensal = signal<{saidas: number; transacoes: number} | null>(null);
  private atualizando = false;
  protected readonly ocupado = signal(false);
  protected readonly carregando = signal(false);
  protected readonly erros = signal<Record<string, string>>({});
  protected readonly admin = signal(false);
  protected readonly saude = signal('Aguardando consulta');
  protected readonly saudeAdmin = signal<SaudeAdministrativa | null>(null);
  protected readonly erroSaude = signal(false);
  protected readonly consultandoSaude = signal(false);
  protected readonly contas = signal<Conta[]>([]);
  protected readonly sincronizando = signal<number[]>([]);
  protected readonly retornoSync = signal<Record<number, { texto: string; erro: boolean }>>({});
  protected readonly gastos = signal<Pagina | null>(null);
  protected readonly alertas = signal<Alerta[]>([]);
  protected readonly filtroAlertas = signal('todos');
  protected readonly buscaAlerta = signal('');
  protected readonly limiteAlertas = signal(8);
  protected readonly alertasFiltrados = computed(() => {
    const busca = this.buscaAlerta().trim().toLocaleLowerCase('pt-BR');
    const dias = this.filtroAlertas() === 'todos' ? null : Number(this.filtroAlertas());
    return this.alertas().filter(a => (!busca || (a.estabelecimento + ' ' + a.mensagem).toLocaleLowerCase('pt-BR').includes(busca))
      && (dias === null || Date.parse(a.criadoEm) >= Date.now() - dias * 86400000));
  });
  protected readonly lojasEmAlerta = computed(() => new Set(this.alertasFiltrados().map(a => a.estabelecimento)).size);
  protected readonly contaRemover = signal<Conta | null>(null);
  protected apagarHistoricoBanco = false;
  protected readonly removendoBanco = signal(false);
  protected readonly erroRemocao = signal('');
  protected contasAtivas() { return this.contas().filter(c => c.ativa !== false); }
  protected abrirRemocao(conta: Conta) {
    this.contaRemover.set(conta); this.apagarHistoricoBanco = conta.ativa === false; this.erroRemocao.set('');
  }
  protected confirmarRemocao() {
    const conta = this.contaRemover();
    if (!conta || this.removendoBanco()) return;
    this.removendoBanco.set(true); this.erroRemocao.set('');
    this.banco.remover(conta.id, this.apagarHistoricoBanco).pipe(finalize(() => this.removendoBanco.set(false))).subscribe({
      next: () => {
        this.contas.update(contas => this.apagarHistoricoBanco
          ? contas.filter(c => c.id !== conta.id)
          : contas.map(c => c.id === conta.id ? {...c,ativa:false} : c));
        this.contaRemover.set(null); this.carregar();
        this.sucessoAviso(this.apagarHistoricoBanco ? 'Banco e histórico removidos. As análises serão recalculadas com os dados restantes.' : 'Banco desconectado. Seu histórico foi preservado.');
      },
      error: e => this.erroRemocao.set(e.status === 409
        ? 'Há uma sincronização em andamento. Aguarde alguns instantes e tente novamente.'
        : mensagemDeErro(e, 'Não foi possível remover esta conexão. Tente novamente.')),
    });
  }
  protected readonly faturas = signal<Fatura[]>([]);
  protected readonly cartoes = computed(() => {
    const comParcelas = new Set(this.faturas().flatMap(mes => mes.porConta.map(conta => conta.contaId)));
    return this.contas().filter(conta => conta.tipo === 'CREDIT' || comParcelas.has(conta.id));
  });
  protected readonly cartaoSelecionado = signal<number | null>(null);
  protected readonly cartao = computed(() =>
    this.cartoes().find(conta => conta.id === this.cartaoSelecionado()) ?? this.cartoes()[0]
  );
  protected readonly proximasFaturas = computed(() => {
    const cartao = this.cartao();
    if (!cartao) return [];
    return this.faturas().flatMap(mes => {
      const parcelas = mes.porConta.find(conta => conta.contaId === cartao.id);
      return parcelas ? [{ ...parcelas, mesReferencia: mes.mesReferencia }] : [];
    });
  });
  protected readonly selos = signal<Selo[]>([]);
  protected readonly dias = signal<string[]>([]);
  protected readonly relatorios = signal<Relatorio[]>([]);
  protected readonly regras = signal<Regra[]>([]);
  protected readonly lojas = signal<Loja[]>([]);
  protected readonly excecoes = signal<Excecao[]>([]);
  protected readonly menu = [
    { id: 'inicio', nome: 'Início' },
    { id: 'faturas', nome: 'Faturas' },
    { id: 'alertas', nome: 'Alertas' },
    { id: 'conquistas', nome: 'Conquistas' },
    { id: 'mais', nome: 'Mais' },
  ];
  protected readonly atalhos = [
    {
      id: 'gatilhos',
      nome: 'Configurar gatilhos',
      descricao: 'Defina quando receber um alerta.',
      icone: '☷',
    },
    {
      id: 'lista',
      nome: 'Lista branca',
      descricao: 'Mantenha estabelecimentos fora da análise.',
      icone: '◇',
    },
    {
      id: 'sumario',
      nome: 'Sumário mensal',
      descricao: 'Entenda os principais gastos do mês.',
      icone: '▤',
    },
    {
      id: 'exportar',
      nome: 'Exportar relatórios',
      descricao: 'Leve seus dados em CSV ou PDF.',
      icone: '↓',
    },
    {
      id: 'contas',
      nome: 'Contas bancárias',
      descricao: 'Gerencie suas conexões com o Open Finance.',
      icone: '▣',
    },
  ];
  protected readonly agora = new Date();
  protected mesRelatorio = '';
  protected formato = 'csv';
  protected editandoRegra: number | null = null;
  protected editandoExcecao: number | null = null;
  protected regra: Parametros = {
    valorUnitarioMax: 50,
    limiteAcumulado: 200,
    janelaDias: 7,
    qtdMinCompras: 3,
  };
  protected excecao = { estabelecimentoId: 0, motivo: '' };
  protected titulo() {
    return (
      (
        {
          inicio: 'Seu dinheiro, com mais intenção.',
          faturas: 'Projeção de faturas',
          alertas: 'Alertas',
          conquistas: 'Conquistas',
          mais: 'Mais',
          gatilhos: 'Configurar gatilhos',
          lista: 'Lista branca',
          sumario: 'Sumário mensal',
          exportar: 'Exportar relatórios',
          contas: 'Contas bancárias',
          saude: 'Saúde da plataforma',
        } as Record<string, string>
      )[this.aba()] ?? 'Meu espaço'
    );
  }
  protected navegar(id: string) {
    this.aba.set(this.admin() ? 'saude' : id);
    this.menuAberto.set(false);
    this.aviso.set('');
    this.tipoAviso.set('info');
  }
  protected total() {
    return (this.gastos()?.resultados ?? []).reduce((s, l) => s + Number(l.total), 0);
  }
  protected barra(total: number) {
    const max = Math.max(1, ...(this.gastos()?.resultados ?? []).map((l) => Number(l.total)));
    return (Number(total) / max) * 100;
  }
  protected relatorioAtual() {
    return this.relatorios().find((r) => r.mes === this.mesRelatorio) ?? this.relatorios()[0];
  }
  protected sequencia() {
    const dias = [...new Set(this.dias())].sort().reverse();
    if (!dias.length) return 0;
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const hojeLocal = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(ontem);
    if (dias[0] !== hojeLocal) return 0;
    let n = 1;
    for (let i = 1; i < dias.length; i++) {
      if (Date.parse(dias[i - 1]) - Date.parse(dias[i]) !== 86400000) break;
      n++;
    }
    return n;
  }
  constructor() {
    afterNextRender(() => {
      timer(15000, 15000).pipe(takeUntilDestroyed(this.destroy)).subscribe(() => {
        if (!this.admin() && !this.ocupado()) this.carregar(true);
      });
      this.api.get<{ id: number; papel: string }>('/usuario/me').subscribe({
        next: (p) => {
          this.admin.set(p.papel === 'SYSADMIN');
          if (this.admin()) {
            this.navegar('saude');
            this.consultarSaude();
          } else this.carregar();
        },
        error: (e) => this.erroAviso(mensagemDeErro(e, 'Não foi possível carregar o perfil.')),
      });
    });
  }
  protected consultarSaude() {
    if (this.consultandoSaude()) return;
    this.consultandoSaude.set(true);
    this.erroSaude.set(false);
    this.api
      .saude()
      .subscribe({
        next: (r) => this.saude.set(r.status === 'UP' ? 'Disponível' : r.status),
        error: () => this.saude.set('Indisponível'),
      });
    this.api.get<SaudeAdministrativa>('/admin/saude')
      .pipe(finalize(() => this.consultandoSaude.set(false)))
      .subscribe({
        next: (resultado) => this.saudeAdmin.set(resultado),
        error: () => this.erroSaude.set(true),
      });
  }
  protected tipoConta(conta: Conta) {
    if (conta.tipo === 'CREDIT') return 'Cartão de crédito';
    if (conta.subtipo === 'CHECKING_ACCOUNT') return 'Conta corrente';
    if (conta.subtipo === 'SAVINGS_ACCOUNT') return 'Conta poupança';
    return 'Conta vinculada';
  }
  protected sincronizar(conta: Conta) {
    if (!conta.podeSincronizar || this.sincronizando().includes(conta.id)) return;
    this.sincronizando.update(ids => [...ids, conta.id]);
    this.retornoSync.update(retornos => ({ ...retornos, [conta.id]: { texto: '', erro: false } }));
    this.banco.sincronizar(conta.id).pipe(
      takeUntilDestroyed(this.destroy),
      finalize(() => this.sincronizando.update(ids => ids.filter(id => id !== conta.id))),
    ).subscribe({
      next: ({ novasTransacoes }) => {
        this.retornoSync.update(retornos => ({ ...retornos, [conta.id]: {
          texto: novasTransacoes === 0 ? 'Conta atualizada. Nenhuma transação nova.'
            : `Conta atualizada. Novas transações: ${novasTransacoes}.`,
          erro: false,
        } }));
        this.carregar();
      },
      error: (e) => {
        const texto = e.status === 429 ? 'Limite diário de sincronizações atingido.'
          : e.status === 409 ? 'Já há uma sincronização em andamento.'
          : mensagemDeErro(e, 'Não foi possível sincronizar agora. Tente novamente.');
        this.retornoSync.update(retornos => ({ ...retornos, [conta.id]: { texto, erro: true } }));
        this.carregar(true);
      },
    });
  }
  protected carregar(silencioso = false) {
    if (this.atualizando) return;
    this.atualizando = true;
    if (!silencioso) this.carregando.set(true);
    this.erros.set({});
    const tarefas = [
      { id:'mensal', obs:this.api.get<{saidas:number;transacoes:number}>('/painel/resumo-mensal'), set:(r:{saidas:number;transacoes:number})=>this.mensal.set(r) },
      {
        id: 'gastos',
        obs: this.api.get<Pagina>('/painel/ralos?tamanho=100'),
        set: (r: Pagina) => this.gastos.set(r),
      },
      {
        id: 'alertas',
        obs: this.api.get<Alerta[]>('/alertas'),
        set: (r: Alerta[]) => this.alertas.set(r),
      },
      {
        id: 'faturas',
        obs: this.api.get<Fatura[]>('/faturas/projecao'),
        set: (r: Fatura[]) => this.faturas.set(r),
      },
      {
        id: 'selos',
        obs: this.api.get<Selo[]>('/gamificacao/selos'),
        set: (r: Selo[]) => this.selos.set(r),
      },
      {
        id: 'dias',
        obs: this.api.get<string[]>('/gamificacao/dias'),
        set: (r: string[]) => this.dias.set(r),
      },
      {
        id: 'relatorios',
        obs: this.api.get<Relatorio[]>('/relatorios'),
        set: (r: Relatorio[]) => {
          this.relatorios.set(r);
          if (!r.some(item => item.mes === this.mesRelatorio)) this.mesRelatorio = r[0]?.mes ?? '';
        },
      },
      {
        id: 'regras',
        obs: this.api.get<Regra[]>('/regras'),
        set: (r: Regra[]) => this.regras.set(r),
      },
      {
        id: 'lojas',
        obs: this.api.get<Loja[]>('/estabelecimentos'),
        set: (r: Loja[]) => this.lojas.set(r),
      },
      {
        id: 'lista',
        obs: this.api.get<Excecao[]>('/lista-branca'),
        set: (r: Excecao[]) => this.excecoes.set(r),
      },
      { id: 'contas', obs: this.banco.listar(true), set: (r: Conta[]) => this.contas.set(r) },
    ];
    let restantes = tarefas.length;
    for (const t of tarefas) {
      (t.obs as import('rxjs').Observable<unknown>)
        .pipe(
          takeUntilDestroyed(this.destroy),
          finalize(() => {
            if (--restantes === 0) { this.carregando.set(false); this.atualizando = false; }
          }),
        )
        .subscribe({
          next: (r) => (t.set as (r: unknown) => void)(r),
          error: (e) =>
            this.erros.update((v) => ({
              ...v,
              [t.id]: mensagemDeErro(
                e,
                'Não foi possível carregar estas informações. Tente atualizar.',
              ),
            })),
        });
    }
  }
  private erroAviso(texto: string) {
    this.tipoAviso.set('erro'); this.aviso.set(texto);
  }
  private sucessoAviso(texto: string) {
    this.tipoAviso.set('sucesso'); this.aviso.set(texto);
  }
  protected salvarRegra() {
    if (this.ocupado()) return;
    this.ocupado.set(true);
    this.api
      .salvarRegra(this.regra, this.editandoRegra)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          this.editandoRegra = null;
          this.carregar();
          this.sucessoAviso('Regra salva.');
        },
        error: (e) => this.erroAviso(mensagemDeErro(e, 'Confira os valores e tente novamente.')),
      });
  }
  protected editarRegra(r: Regra) {
    this.editandoRegra = r.id;
    this.regra = { ...r.parametros };
  }
  protected excluir(rota: string, id: number | null) {
    if (!id || this.ocupado()) return;
    this.ocupado.set(true);
    this.api
      .excluir(rota, id)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          this.carregar();
          this.sucessoAviso('Item removido.');
        },
        error: (e) => this.erroAviso(mensagemDeErro(e, 'Não foi possível remover.')),
      });
  }
  protected salvarExcecao() {
    if (this.ocupado() || this.excecao.estabelecimentoId <= 0 || !this.excecao.motivo.trim()) return;
    this.ocupado.set(true);
    this.api
      .salvarExcecao(this.excecao, this.editandoExcecao)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          this.cancelarExcecao();
          this.carregar();
          this.sucessoAviso('Lista branca atualizada.');
        },
        error: (e) =>
          this.erroAviso(mensagemDeErro(e, 'Confira os dados. A loja pode já estar na lista.')),
      });
  }
  protected editarExcecao(item: Excecao) {
    this.editandoExcecao = item.id;
    this.excecao = { estabelecimentoId: item.estabelecimentoId, motivo: item.motivo };
  }
  protected cancelarExcecao() {
    this.editandoExcecao = null;
    this.excecao = { estabelecimentoId: 0, motivo: '' };
  }
  protected nomeLoja(id: number) {
    return this.lojas().find(loja => loja.id === id)?.nome
      ?? this.excecoes().find(item => item.estabelecimentoId === id)?.nome
      ?? 'Estabelecimento ' + id;
  }
  protected exportar() {
    if (this.ocupado()) return;
    this.ocupado.set(true);
    this.api
      .exportar(this.formato)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob),
            a = document.createElement('a');
          a.href = url;
          a.download = 'neurowallet-relatorios.' + this.formato;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 30000);
          this.sucessoAviso('Arquivo gerado. Confira seus downloads.');
        },
        error: (e) => this.erroAviso(mensagemDeErro(e, 'Não foi possível exportar o relatório.')),
      });
  }
  protected sair() {
    this.auth
      .sair()
      .subscribe({
        next: () => this.router.navigateByUrl('/login'),
        error: () => this.router.navigateByUrl('/login'),
      });
  }
}
