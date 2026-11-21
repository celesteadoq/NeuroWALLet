# NeuroWALLet — Frontend

Frontend Angular 22 conectado à NeuroWALLet API Java.

## Preparar o projeto

Se ainda não baixou os repositórios, execute:

```powershell
git clone https://github.com/MarcoAn778/NeuroWALLet_back_end.git neurowallet-api
cd neurowallet-api
git clone https://github.com/celesteadoq/NeuroWALLet.git frontend
```

Coloque o **`.env` enviado pela equipe em `neurowallet-api/.env`**, ao lado do `pom.xml`. As credenciais da API e dos provedores ficam no backend. O frontend usa as rotas `/api` no mesmo endereço do portal.

## Executar com Docker

Abra o Docker Desktop e execute na raiz do **backend**, onde está o `iniciar.ps1`:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar.ps1 -Demonstracao
```

O comando monta o frontend e inicia a API, os serviços e os bancos fictícios Aurora e Horizonte. Abra [o portal](http://localhost:3000) quando o script terminar. Para usar a Pluggy, execute o mesmo comando sem `-Demonstracao` e configure o webhook HTTPS conforme o [README do backend](https://github.com/MarcoAn778/NeuroWALLet_back_end#consentimento-open-finance).

Para parar o modo demonstração, execute `powershell -ExecutionPolicy Bypass -File .\parar.ps1 -Demonstracao` na raiz do backend. Para o modo normal, execute sem `-Demonstracao`.

## Executar sem Docker

1. Instale o Node.js **24.15 ou posterior da linha 24**, com npm. Confira com `node --version` e `npm.cmd --version`.
2. Siga o [guia do backend sem Docker](https://github.com/MarcoAn778/NeuroWALLet_back_end#executar-sem-docker) para iniciar PostgreSQL, RabbitMQ, Mailpit e a API Java. Confirme que [a API local](http://localhost:8080/actuator/health) responde antes de iniciar o frontend.
3. Em outro terminal, na pasta `frontend`, execute:

   ```powershell
   npm.cmd ci
   npm.cmd start
   ```

4. Abra [o portal](http://localhost:3000). Para parar o Angular, pressione `Ctrl+C` no terminal.

No Linux e macOS, use `npm` no lugar de `npm.cmd`. O arquivo `proxy.conf.json` encaminha `/api/**` e `/actuator/**` para `http://localhost:8080`. Se o portal abrir, mas o cadastro ou login falhar, confira [a saúde pelo proxy](http://localhost:3000/actuator/health) e confirme que o backend usa `FRONTEND_ORIGIN=http://localhost:3000`.

## Fluxos integrados

- Cadastro com consentimento LGPD, seguido de login (o cadastro retorna uma resposta genérica).
- Login com token temporário, configuração do autenticador por QR/chave, confirmação TOTP e códigos de recuperação.
- Sessão Bearer JWT: sessionStorage sem a opção Manter conectado; localStorage com a opção marcada. O token temporário de 2FA permanece apenas na aba. Renovação de acesso e logout com limpeza dos tokens dos dois armazenamentos.
- Recuperação de senha por e-mail; o link chega ao Mailpit local em http://localhost:8025. O front recebe /redefinir-senha#token=... e remove o token da URL após a leitura.
- Conexão via Pluggy Connect com token emitido pela API. Credenciais Pluggy e webhook HTTPS ficam no backend. A seleção da instituição acontece no widget. A tela aguarda o webhook e permite consultar novamente.
- Lista de contas, importação manual, resumo mensal, alertas, projeção de faturas, selos e relatórios com dados da API ou estado vazio. O sumário narrativo fica disponível automaticamente após o fechamento do mês e a análise das transações.

A classificação e os textos gerados por IA usam o provedor configurado no backend, Gemini ou Anthropic. A conexão bancária real depende da configuração da Pluggy. Com o Mailpit configurado, acompanhe os e-mails locais na [caixa de teste](http://localhost:8025).

## Build e testes

```powershell
npm.cmd run build
npm.cmd test -- --watch=false
```

O build gera `dist/neuro-wallet`. Para verificar o build localmente com o backend rodando na porta `8080`, execute `npm.cmd run serve:ssr:neuro-wallet` e abra [localhost:4000](http://localhost:4000). Ajuste `FRONTEND_ORIGIN` no backend para `http://localhost:4000` antes de iniciar a API com essa configuração.

O painel segue a identidade visual do Figma, com navegação superior e menu compacto no celular. Inclui resumo, faturas, alertas, conquistas, contas, criação/edição/exclusão de gatilhos e lista branca, sumários e exportação de relatórios em CSV/PDF. As informações que a API não fornece não são simuladas. As animações respeitam a preferência de movimento reduzido. Termos de uso e política de privacidade possuem páginas próprias com texto de exemplo para revisão da equipe.

A autenticação permite nova tentativa após erro, informa limites de requisições e possui tempo limite de rede. Os testes cobrem código incorreto, excesso de tentativas, sessão expirada e prevenção de envios duplicados.
