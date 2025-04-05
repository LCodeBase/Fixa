# Fixa - Plataforma Inteligente de Memorização com Flashcards

## Visão Geral

O Fixa é um aplicativo web de alta qualidade voltado para reforço de memória por meio de flashcards com repetição espaçada. O objetivo principal é ajudar estudantes, concurseiros, autodidatas e profissionais em aprendizado contínuo a memorizar conteúdos de forma eficiente, sistemática e agradável.

Mais do que um app de flashcards tradicional, o Fixa se propõe a ser uma plataforma completa de memorização, unindo ciência cognitiva com tecnologia de ponta. A experiência do usuário é o centro do projeto: fluidez, design moderno, personalização e funcionalidades inteligentes são diferenciais marcantes.

## Público-alvo

- Estudantes de ensino médio e superior
- Concurseiros e vestibulandos
- Autodidatas e profissionais que estudam continuamente
- Pessoas que precisam memorizar idiomas, conceitos técnicos, leis, fórmulas, etc.

## Funcionalidades Principais (MVP)

- Autenticação de usuários (Google ou email/senha)
- Criação e organização de decks de flashcards
- Algoritmo de repetição espaçada (inspirado no SM-2, do Anki)
- Visualização de progresso e estatísticas de aprendizagem
- Notificações de revisão (via navegador)
- Suporte a mídia nos flashcards: texto, imagens e áudio
- Interface responsiva, com modo escuro
- Personalização: escolha de tema, fonte e frequência de notificações

## Diferenciais

- Sugestões automáticas de decks com base em temas populares ou interesses do usuário
- Importação de decks do Anki e via arquivos CSV
- Compartilhamento de decks entre usuários
- Sistema inteligente de recomendações futuras (IA)
- Geração automática de flashcards a partir de PDFs, artigos e textos (planejado para futuras versões)

## Tecnologias Utilizadas

- **Frontend**: React com TypeScript, Tailwind CSS
- **Backend**: Node.js com Express
- **Banco de Dados**: MongoDB
- **Autenticação**: Firebase Authentication
- **Hospedagem**: GitHub Pages (frontend) e Vercel (backend)

## Instalação e Execução

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- MongoDB (local ou Atlas)

### Instalação

1. Clone o repositório
2. Instale as dependências do frontend e backend
3. Configure as variáveis de ambiente
4. Execute o servidor de desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fixa.git
cd fixa

# Instale as dependências do frontend
cd frontend
npm install

# Instale as dependências do backend
cd ../backend
npm install

# Execute o frontend
cd ../frontend
npm start

# Execute o backend (em outro terminal)
cd ../backend
npm start
```

## Métricas de Sucesso

- Taxa de retenção de usuários
- Frequência de revisões realizadas
- Feedback qualitativo dos usuários
- Evolução no desempenho e na memorização ao longo do tempo

## Missão

Tornar o Fixa a plataforma de referência em memorização digital, entregando uma ferramenta que realmente funcione para fixar o conhecimento, com base na ciência e apoiada pela tecnologia.