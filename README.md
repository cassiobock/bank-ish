# bank-ish

## Visão geral
A aplicação permite acessar e visualizar as informações do Internet Banking. Atualmente, o único banco suportado é o Nubank. \
As tecnologias utilizadas são [Node.js](https://nodejs.org) com [Typescript](https://www.typescriptlang.org), [Puppeteer](https://pptr.dev), [MongoDB](https://www.mongodb.com) e [Docker](https://docker.com).

## Usando a aplicação
1. Iniciar a aplicação executando o comando `docker-compose up` e acessar http://localhost:3000
2. Ao acessar a página inicial da aplicação, é necessário preencher o usuário (somente os dígitos do CPF) e a senha e submeter o formulário
3. Após isso, você será redirecionado pra página com o QR Code, que deve ser validado através do aplicativo do Nubank
4. Após a identificação do QR Code, a página será redirecionada para uma lista com a lista de compras realizadas na fatura em aberto

## Desenvolvimento
### Requisitos
- Node.js: 12.17.0
- Docker: 19.03.12
- Docker-compose: 1.26.2

### Variáveis de ambiente
É necessário exportar algumas variáveis de ambiente antes de iniciar a aplicação, são elas:
- SESSION_SECRET: configura o secret usado pela dependência [`express-session`](https://www.npmjs.com/package/express-session)
- DB_HOST: configura a URI utilizada para se conectar ao MongoDB
- NODE_ENV (opcional): caso seja definida como `development`, o Puppeteer será iniciado com o parâmetro `{ headless: false }`, exibindo a janela do Chromium durante a execução

### Estrutura do projeto
```
/
├── src/
│   ├── browser/
│   │   └── pool.ts => gerencia a execução do chromium e também é responsável por manter a referência da página e o usuário
│   ├── connector/nubank/
│   │   ├── extractor.ts => métodos utilizados para a extração de informação do DOM
│   │   ├── model.ts => possui a definição do model utilizando Mongoose
│   │   ├── scraper.ts => métodos utilizados para a navegação e interação com as páginas do internet banking
│   │   └── index.ts => métodos responsáveis por obter os dados da página utilizando o scraper.ts, salvá-los no banco utilizando o model.ts e retornar a versão mais recente
│   ├── infra/
│   │   └── db.ts => responsável por iniciar a conexão com o banco de dados
│   ├── public/
│   │   ├── css/ => estilos utilizados nas páginas
│   │   ├── index.html => página de login
│   │   ├── validation.html => página de validação do QR Code
│   │   └── bills.html => página onde as informações da conta são exibidas
│   ├── app.ts => arquivo com as configurações do express e definição de rotas
└── └── server.ts => arquivo responsável por iniciar a conexão com banco de dados, o browser e o servidor HTTP
```

### Iniciando o projeto para desenvolvimento
O primeiro passo é executar a task de build com watch dos arquivos, usando o comando `npm run build:dev`. \
Após isso, utilize o comando `npm run dev` para iniciar o servidor HTTP usando o [nodemon](https://nodemon.io/)

#### Mais informações do processo de build
O projeto utiliza o [Webpack](https://webpack.js.org) para transpilar o código em Typescript e copiar os arquivos em `/src/public`

### Links Úteis
Configuração do Puppeteer no Docker: [Running Puppeteer in Docker](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker) \

### Melhorias
Alguns pontos poderiam ser melhorados:
- logs melhores
- testes unitários
- usar a API não oficial do Nubank: https://mobile.twitter.com/nubank/status/766665014161932288
- melhorias na estabilidade da sessão e expiração 
- possibilidade de selecionar as faturas anteriores (os dados já existem, apenas não estão sendo exibidos na página)
- não utilizar a `MemoryStore`, que é a session store padrão do `express-session`
- adicionar linter
