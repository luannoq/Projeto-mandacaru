# 🌱 Akaru — Plantio inteligente, colheita certa

> **Global Solution 2026/1 — FIAP**
> Análise e Desenvolvimento de Sistemas · Disciplina **Mobile Application Development**

Akaru é um aplicativo mobile (React Native + Expo) que conecta a **economia espacial**
à agricultura brasileira: usa **dados climáticos de satélite** e **IA Generativa (Gemini)**
para recomendar ao produtor rural **o que plantar, quando e como**, de acordo com a cultura
escolhida e as condições climáticas da sua região.

---

## 👥 Integrantes

| Nome | RM |
| --- | --- |
| Luann | RM560313 |
| Juan Pablo | RM[A PREENCHER] |
| Lucas Higuti | RM[A PREENCHER] |
| Victor | RM[A PREENCHER] |
| Renato | RM[A PREENCHER] |

> Atualize os RMs pendentes antes da entrega no Portal FIAP.

---

## 📝 Descrição da solução (Global Solution)

O tema da GS 2026/1 é a **economia espacial** — como a tecnologia espacial pode resolver
problemas reais na Terra. O Akaru ataca a frente **Agro & Clima**: satélites monitoram clima
e produtividade, e o app traduz esses dados em recomendações práticas de plantio.

**Fluxo do usuário:**

1. **Login / Cadastro** com autenticação real (Firebase).
2. **Home** — saudação, clima atual da região e últimas consultas.
3. **Nova análise** — o produtor escolhe a cultura (milho, café, soja, etc.) e pode descrever
   detalhes do solo/irrigação.
4. **Resultado** — recomendação com época ideal, espaçamento, irrigação e alertas de risco.
5. **IAkaru** — assistente de IA generativa para tirar dúvidas em linguagem natural.
6. **Histórico** — todas as consultas anteriores.

**ODS da ONU atendidas:** 2 (Fome zero e agricultura sustentável), 9 (Indústria, inovação e
infraestrutura), 13 (Ação contra a mudança do clima).

---

## 🎥 Vídeo de demonstração

> **YouTube (não listado):** _[link a adicionar quando o vídeo for gravado]_

---

## 🛠️ Tecnologias

- **Expo SDK 54** + **Expo Router 6** (navegação baseada em arquivos)
- **React 19** / **React Native 0.81**
- **TypeScript** (`strict: true`)
- **Firebase Authentication** (Firebase JS SDK — compatível com Expo Go)
- **Axios** com interceptor que injeta o ID Token do Firebase em cada requisição
- **@expo/vector-icons** (Ionicons)
- Fontes **Poppins** (`@expo-google-fonts/poppins`)
- **ESLint** (preset `eslint-config-expo`) + **Prettier** para padronização de código

> **Sobre o Firebase:** usamos o **Firebase JS SDK** (`firebase`) em vez do
> `@react-native-firebase`. O JS SDK roda no Expo Go e em dev builds sem configuração nativa
> (`google-services.json`), o que simplifica o desenvolvimento e a publicação via Firebase App
> Distribution. O interceptor do Axios obtém o token com `auth.currentUser?.getIdToken()`.

---

## 🎨 Design System

Todo o visual é centralizado em [`constants/theme.ts`](constants/theme.ts), garantindo
consistência entre as telas e facilitando a manutenção:

- **Paleta agro:** verde escuro (`#1B4D1E`), verde médio (`#2E7D32`), verde claro (`#C8E6C9`)
  e fundo bege (`#F5F2EC`), além de cores semânticas para estados (aviso, erro, info).
- **Tipografia Poppins** em 4 pesos (regular, medium, semibold, bold) com escala definida
  (`h1`, `h2`, `h3`, `body`, `caption`, `overline`).
- **Espaçamentos, raios e sombras** padronizados (tokens `spacing`, `radius`, `shadow`).
- **Status de recomendação** com cores próprias: `Ideal`, `Atenção`, `Risco`.

Componentes reutilizáveis seguem o design system:
[`Button`](components/Button.tsx) (filled/outline + loading),
[`TextField`](components/TextField.tsx) (ícone + toggle de senha) e
[`StatusChip`](components/StatusChip.tsx).

---

## 🤖 IAkaru — assistente de IA generativa

O **IAkaru** ([`app/iakaru.tsx`](app/iakaru.tsx)) é um chat conversacional que responde
dúvidas do produtor sobre plantio, clima e manejo. Na arquitetura final ele consome um
endpoint de **IA Generativa (Google Gemini)** servido pelo backend (Java Spring AI / .NET),
combinando o contexto climático de satélite com a pergunta do usuário.

> **Estado atual:** as respostas estão mockadas em
> [`services/iakaru.ts`](services/iakaru.ts) (marcadas com `// TODO: integrar com API real`)
> enquanto o endpoint do Gemini é finalizado.

---

## 📂 Estrutura de pastas

```
/app
  /(auth)        → login.tsx, cadastro.tsx              (rotas públicas)
  /(tabs)        → index, analise, historico, perfil    (rotas protegidas)
  resultado.tsx  → recomendação gerada
  iakaru.tsx     → chat com o assistente IAkaru
  _layout.tsx    → layout raiz: fontes, AuthProvider e proteção de rotas
/components       → Button, TextField, StatusChip (reutilizáveis)
/contexts         → AuthContext (Firebase Authentication + estado global)
/services         → api (axios), firebase, culturas, recomendacao, historico, iakaru, mocks
/hooks            → useAuth
/constants        → theme (design system) e commit (hash do build)
/scripts          → get-commit-hash.js (gera o hash do commit p/ a tela "Sobre")
```

Separação de responsabilidades: **UI** (`app`/`components`), **estado** (`contexts`),
**acesso a dados** (`services`), **design** (`constants`).

---

## ▶️ Como rodar o projeto

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Configure o Firebase:** copie `.env.example` para `.env` e preencha com as credenciais do
   seu projeto (Console do Firebase → Configurações do projeto → App Web).
   ```bash
   cp .env.example .env
   ```
3. **Inicie o app:**
   ```bash
   npx expo start
   ```
   Abra no **Expo Go** (Android/iOS) lendo o QR Code, ou pressione `a` / `i`.

> ⚠️ O Expo Go atual exige **SDK 54**. Sem o `.env`, o app abre normalmente, mas o
> login/cadastro falham (precisam de credenciais reais do Firebase).

### Scripts disponíveis

| Script | O que faz |
| --- | --- |
| `npm start` | Inicia o servidor Expo |
| `npm run lint` | Roda o ESLint (`expo lint`) |
| `npm run format` | Formata o código com Prettier |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |
| `npm run commit-hash` | Gera o hash do commit atual em `constants/commit.json` |

---

## 🔖 Hash do commit na tela "Sobre o App"

A tela **Sobre o App** ([`app/(tabs)/perfil.tsx`](app/(tabs)/perfil.tsx)) exibe o **hash real
do commit** de referência, atendendo ao requisito de publicação da disciplina (a versão
publicada deve corresponder exatamente ao código-fonte).

O valor é lido de [`constants/commit.json`](constants/commit.json), gerado pelo script
[`scripts/get-commit-hash.js`](scripts/get-commit-hash.js). **Rode o script antes de cada
build/publicação** para que o hash exibido reflita o código enviado:

```bash
npm run commit-hash
```

Opcionalmente, é possível sobrescrever o valor via variável de ambiente
`EXPO_PUBLIC_GIT_COMMIT_HASH`.

---

## 📡 Integração com a API (em andamento)

A camada [`services/`](services/) já tem o cliente Axios pronto
([`services/api.ts`](services/api.ts)) apontando para `EXPO_PUBLIC_API_URL`. As operações
ainda consomem [`services/mocks.ts`](services/mocks.ts); cada ponto de integração está marcado
com `// TODO: integrar com API real` e será conectado ao backend **Java Spring Boot / .NET**
(CRUD de culturas, recomendações, histórico e o endpoint Gemini do IAkaru).

---

## 📱 Telas

> _Prints a adicionar:_ Login · Cadastro · Home · Nova análise · Resultado · IAkaru · Histórico · Sobre o App

```
assets/screenshots/  → (adicionar capturas das telas aqui antes da entrega)
```
