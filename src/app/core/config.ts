export const API = {
  /**
   * Prefixo de todas as chamadas ao back-end.
   * Em desenvolvimento, o proxy.conf.json encaminha /api para o servidor do back.
   */
  baseUrl: '/api',

  /**
   * true  = o "back de mentira" (mock-api.interceptor.ts) responde as chamadas.
   * false = as chamadas vão de verdade para o back-end.
   * Quando o back existir, troque para false. Nenhum serviço ou página precisa mudar.
   */
  usarMock: true,
};
