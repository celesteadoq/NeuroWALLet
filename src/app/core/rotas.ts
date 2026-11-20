import { ProximoPasso } from '../models/api.models';

/** Traduz a resposta do back ("proximo") na rota da tela. Renomeou uma rota? Mude só aqui. */
export const ROTA_POR_PASSO: Record<ProximoPasso, string> = {
  'verificar-email': '/verificacao-2-fatores-c',
  'ativar-2fa': '/verificacao-2-fatores-c2',
  'verificar-2fa': '/verificacao-2-fatores-l',
  'conectar-banco': '/banco',
  inicio: '/inicio',
};
