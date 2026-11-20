# NeuroWALLet — Frontend

Frontend Angular conectado à NeuroWALLet API Java. Requer Node 24.15 ou superior compatível com Angular 22 e npm.

## Executar localmente

1. No backend, configure o arquivo local .env e execute PostgreSQL, RabbitMQ e Mailpit com docker compose up -d --wait.
2. Inicie a API Java na porta 8080, conforme o README do backend.
3. Neste repositório, execute npm ci e npm start.
4. Abra http://localhost:3000.

O proxy.conf.json encaminha /api/** para http://localhost:8080. O backend deve usar FRONTEND_ORIGIN=http://localhost:3000. Alterações nessa variável exigem reiniciar a API.

## Fluxos integrados

- Cadastro com consentimento LGPD, seguido de login (o cadastro retorna uma resposta genérica).
- Login com token temporário, configuração do autenticador por QR/chave, confirmação TOTP e códigos de recuperação.
- Sessão Bearer JWT em sessionStorage da aba, renovação coordenada do refresh token e logout.
- Recuperação de senha por e-mail; o link chega ao Mailpit local em http://localhost:8025. O front recebe /redefinir-senha#token=... e remove o token da URL após a leitura.
- Conexão via Pluggy Connect com token emitido pela API. Credenciais Pluggy e webhook HTTPS ficam no backend. A seleção da instituição acontece no widget. A tela aguarda o webhook e permite consultar novamente.
- Lista de contas, importação manual, resumo mensal, alertas, projeção de faturas, selos e relatórios com dados reais ou estado vazio.

A classificação e os relatórios gerados por IA dependem da chave Anthropic no backend. A conexão bancária real depende da configuração Pluggy. Nenhuma chave secreta de provedor deve ser colocada no frontend.

## Build e testes

npm run build
npm test -- --watch=false

O build gera dist/neuro-wallet. As páginas são renderizadas no cliente para manter os tokens no navegador. O servidor Node distribuído encaminha /api ao backend; execute npm run serve:ssr:neuro-wallet. API_TARGET define a origem da API (padrão http://127.0.0.1:8080); PORT define a porta do front (padrão 4000). Ajuste FRONTEND_ORIGIN para a origem pública do front. Use HTTPS no ambiente publicado.

O proxy do ng serve é usado apenas durante desenvolvimento. Se hospedar somente os arquivos estáticos, configure o servidor de hospedagem para encaminhar /api/** ao backend e retornar index.html para as rotas do Angular.

Termos de uso e política de privacidade continuam como páginas em construção, aguardando conteúdo da equipe.
