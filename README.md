# 🌱 Akaru — Plantio inteligente, colheita certa

> **Global Solution 2026/1 — FIAP**
> Análise e Desenvolvimento de Sistemas · Disciplina **Mobile Application Development**

Akaru é um aplicativo mobile (React Native + Expo) que conecta a **economia espacial**
à agricultura brasileira: usa **dados climáticos de satélite** e **IA Generativa (Gemini)**
para recomendar ao produtor rural **o que plantar, quando e como**, de acordo com a cultura
escolhida e as condições climáticas da sua região.

---

## 👥 Integrantes

| Nome                              | RM       |
| --------------------------------- | -------- |
| Luann Noqueli Klochko             | RM560313 |
| Juan Pablo Rebelo Coelho          | RM560445 |
| Lucas Higuti Fontanezi            | RM561120 |
| Victor Rodrigues De Lima Lourenco | RM560087 |
| Renato Silva Alexandre Bezerra    | RM560928 |

---

## 📝 Descrição da solução (Global Solution)

O tema da GS 2026/1 é a **economia espacial** — como a tecnologia espacial pode resolver
problemas reais na Terra. O Akaru ataca a frente **Agro & Clima**: satélites monitoram clima
e produtividade, e o app traduz esses dados em recomendações práticas de plantio.

**Fluxo do usuário:**

1. **Login / Cadastro** com autenticação real (JWT da API Java).
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
- **API Java (Spring Boot)** do back-end — 2 microserviços (catálogo e recomendação)
- **Autenticação por JWT** próprio da API Java (token persistido no AsyncStorage)
- **Axios** com 2 instâncias e interceptor que injeta o `Bearer {token}` em cada requisição
- **@expo/vector-icons** (Ionicons)
- Fontes **Poppins** (`@expo-google-fonts/poppins`)
- **ESLint** (preset `eslint-config-expo`) + **Prettier** para padronização de código

> **Sobre o Firebase:** o Firebase **não é mais usado para autenticação** (login/cadastro
> agora passam pela API Java via JWT). O pacote `firebase` continua instalado por ser usado
> apenas para **publicação do app via Firebase App Distribution**.

---

## 🏗️ Arquitetura de integração (API Java)

O app conversa com **dois microserviços** Spring Boot, cada um com sua própria URL
(configurável por variável de ambiente):

| Serviço          | Porta padrão | Variável                           | Responsável por                       |
| ---------------- | ------------ | ---------------------------------- | ------------------------------------- |
| **Catálogo**     | `8081`       | `EXPO_PUBLIC_API_CATALOGO_URL`     | Culturas + auth                       |
| **Recomendação** | `8082`       | `EXPO_PUBLIC_API_RECOMENDACAO_URL` | Recomendações (Gemini) + clima + auth |

**Autenticação (JWT):** `POST /api/auth/login` e `/register` retornam um token. O
[`AuthContext`](contexts/AuthContext.tsx) salva o token em `akaru_auth_token` e o usuário em
`akaru_user` (AsyncStorage). As 2 instâncias do Axios em [`services/api.ts`](services/api.ts)
compartilham um interceptor que injeta `Authorization: Bearer {token}` e, ao receber **401**,
limpa a sessão e volta para o login.

**Camada de dados** ([`services/`](services/)) consome a API real e mapeia os DTOs de
[`types/api.ts`](types/api.ts):

| Service                                       | Endpoints                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| [`auth.ts`](services/auth.ts)                 | `POST /api/auth/login` · `POST /api/auth/register`                                |
| [`culturas.ts`](services/culturas.ts)         | `GET /api/culturas` · `GET /api/culturas/{id}`                                    |
| [`clima.ts`](services/clima.ts)               | `GET /api/clima?lat=&lon=`                                                        |
| [`recomendacao.ts`](services/recomendacao.ts) | `POST` · `GET` · `PUT` · `DELETE /api/recomendacao/{id}`                          |
| [`historico.ts`](services/historico.ts)       | sem endpoint — guarda IDs no AsyncStorage (`akaru_historico_ids`) e busca cada um |

**Erros:** [`utils/handleApiError.ts`](utils/handleApiError.ts) traduz os erros do Axios
(400/401/403/404/409/503/rede) em mensagens amigáveis exibidas com `Alert.alert`.

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
dúvidas do produtor sobre plantio, clima e manejo. As **respostas são reais**, geradas por
**IA Generativa (Google Gemini)** via API Java — [`services/iakaru.ts`](services/iakaru.ts)
chama `POST /api/iakaru/chat` enviando a pergunta e o contexto da cultura. As respostas em
Markdown são renderizadas na tela ([`constants/markdown.ts`](constants/markdown.ts)).

---

## 📂 Estrutura de pastas

```
/app
  /(auth)        → login.tsx, cadastro.tsx              (rotas públicas)
  /(tabs)        → index, analise, historico, perfil    (rotas protegidas)
  resultado.tsx  → recomendação gerada
  iakaru.tsx     → chat com o assistente IAkaru
  _layout.tsx    → layout raiz: fontes, AuthProvider e proteção de rotas
/components       → Button, TextField, StatusChip, LocationBadge, AptidaoBadge
/contexts         → AuthContext (JWT da API Java + estado global)
/services         → api (2 instâncias axios), auth, culturas, clima, recomendacao, historico, iakaru, firebase, mocks
/hooks            → useAuth, useLocation (GPS via expo-location)
/types            → api (DTOs da API Java)
/utils            → handleApiError (mensagens de erro amigáveis)
/constants        → theme (design system), culturas (emojis), estados (UF), commit (hash do build)
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
2. **Configure as variáveis de ambiente:** copie `.env.example` para `.env` e ajuste as URLs
   da API Java (e, opcionalmente, as credenciais do Firebase usadas só para App Distribution).
   ```bash
   cp .env.example .env
   ```
   ```bash
   EXPO_PUBLIC_API_CATALOGO_URL=http://localhost:8081
   EXPO_PUBLIC_API_RECOMENDACAO_URL=http://localhost:8082
   EXPO_PUBLIC_USE_MOCKS=false
   ```
3. **Inicie o app:**
   ```bash
   npx expo start
   ```
   Abra no **Expo Go** (Android/iOS) lendo o QR Code, ou pressione `a` / `i`.

> ⚠️ O Expo Go atual exige **SDK 54**. Sem a API Java no ar (ou as URLs corretas no `.env`),
> o login/cadastro e o carregamento de dados falham com mensagens de erro amigáveis.

### Testando no Expo Go com ngrok

`localhost` **não resolve** do celular. Para testar no dispositivo físico, a API precisa estar
exposta publicamente — o jeito mais simples é via **ngrok** (rodado por quem sobe a API):

1. Suba os 2 microserviços localmente (portas `8081` e `8082`).
2. Exponha cada um: `ngrok http 8081` e `ngrok http 8082` (2 terminais → 2 URLs públicas).
3. Coloque as URLs no `.env` do mobile:
   ```bash
   EXPO_PUBLIC_API_CATALOGO_URL=https://<sub>.ngrok-free.app
   EXPO_PUBLIC_API_RECOMENDACAO_URL=https://<outro>.ngrok-free.app
   ```
4. Reinicie o Expo (`npx expo start -c`) para recarregar as variáveis.

> ⚠️ **CORS (importante):** o serviço de **catálogo (8081)** usa `setAllowedOrigins`, que
> **não aceita wildcards** — a URL do ngrok precisa ser adicionada manualmente em
> `APP_ALLOWED_ORIGINS` (no `application.properties` da API) a cada nova sessão de ngrok.
> Já o serviço de **recomendação (8082)** usa `setAllowedOriginPatterns`, que **aceita
> wildcards**, então não exige esse ajuste.

### Scripts disponíveis

| Script                 | O que faz                                              |
| ---------------------- | ------------------------------------------------------ |
| `npm start`            | Inicia o servidor Expo                                 |
| `npm run lint`         | Roda o ESLint (`expo lint`)                            |
| `npm run format`       | Formata o código com Prettier                          |
| `npm run format:check` | Verifica a formatação sem alterar arquivos             |
| `npm run commit-hash`  | Gera o hash do commit atual em `constants/commit.json` |

---

## 📍 Localização (GPS)

O app usa **expo-location** para capturar a localização do produtor e enviar
`latitude`/`longitude` (+ cidade/estado) no payload da recomendação — a API Java gera
recomendações específicas para a região.

- **Permissão pedida:** localização **em uso** (_when in use_). No Android,
  `ACCESS_FINE_LOCATION` e `ACCESS_COARSE_LOCATION`; no iOS,
  `NSLocationWhenInUseUsageDescription`.
- **Mensagem exibida ao usuário:** _"Akaru precisa da sua localização para fornecer
  recomendações de plantio precisas para sua região."_
- **Onde é usada:**
  - **Cadastro** — botão "Usar GPS" captura cidade/estado via reverse geocoding.
  - **Home** — captura automática ao abrir; a cidade real aparece no card de clima.
  - **Nova análise** — `lat`/`lon` são incluídos nos parâmetros enviados ao Resultado.
- **Fallback:** se a permissão for negada, o app continua funcionando com a localização
  mockada (`São Paulo, SP`).

A lógica fica no hook [`hooks/useLocation.ts`](hooks/useLocation.ts) e o componente
[`components/LocationBadge.tsx`](components/LocationBadge.tsx) exibe a localização atual.

---

## 🔖 Hash do commit na tela "Sobre o App"

A tela **Sobre o App** ([`app/(tabs)/perfil.tsx`](<app/(tabs)/perfil.tsx>)) exibe o **hash real
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
