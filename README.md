# 📚 Plataforma de Artigos Técnicos com Scraper

Uma aplicação full-stack para gerenciar artigos técnicos, com integração de um scraper em Python para importação automática de conteúdo.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js (React)
- **Backend**: Node.js (API Routes)
- **Scraper**: Python (BeautifulSoup)

## 🔧 Pré-requisitos

- Node.js (v14 ou superior)
- Python (3.6 ou superior) [apenas para o scraper]
- npm ou yarn

## ⚙️ Instalação e Configuração

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/isabellacgmsa/platform-article/
   cd platform-article
   ```

2. **Instale as dependências do Node.js**:
   ```bash
   npm install
   # ou
   yarn install
   ```

## 🏃 Executando o Projeto

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

## 🛠️ Funcionalidades

✅ Listagem de artigos  
✅ Página de detalhes do artigo  
✅ Área administrativa (CRUD)  
✅ API REST para gerenciamento de artigos  
✅ Scraper Python para importação automática  


## 📝 Rotas da API

- `GET /api/articles` - Lista todos os artigos
- `GET /api/articles/:id` - Retorna um artigo específico
- `POST /api/articles` - Cria um novo artigo
- `PUT /api/articles/:id` - Atualiza um artigo
- `DELETE /api/articles/:id` - Remove um artigo
- 
## 🐍 Scraper Python (Bônus)

O script Python utiliza BeautifulSoup para extrair artigos do DEV.to e enviá-los para a API da aplicação.

### Funcionalidades do Scraper:
- Acessa a seção de Node.js do DEV.to (`https://dev.to/t/node`)
- Extrai os 5 artigos mais recentes
- Coleta título, resumo e link de cada artigo
- Verifica se o artigo já existe na base de dados
- Envia apenas artigos novos para a API

### Como executar:
1. Certifique-se que a aplicação Next.js está rodando (`npm run dev`)
2. Execute o scraper:
```bash
python scripts/scraper.py
```

### Fluxo de trabalho:
1. Acessa a página de Node.js no DEV.to
2. Extrai informações dos 5 primeiros artigos
3. Verifica na API quais artigos já existem
4. Envia apenas os artigos novos para a API

### Dependências Python:
Instale as dependências com:
```bash
pip install beautifulsoup4 requests
```

### Observações:
- O scraper evita duplicação verificando URLs existentes
- Requer que a API esteja acessível em `http://localhost:3000`
- Pode ser adaptado para outros sites alterando a função `scrape_devto_articles`
