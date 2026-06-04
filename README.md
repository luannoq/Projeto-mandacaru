# Akaru — Plantio inteligente, colheita certa

## Global Solution 2026/1 — FIAP

**Integrantes:**
- Luann — RM560313
- Juan Pablo — RM[RM]
- Lucas Higuti — RM[RM]
- Victor — RM[RM]
- Renato — RM[RM]

**Descrição:** App de recomendação agrícola que usa dados climáticos de satélite e IA Generativa (Gemini) para orientar agricultores brasileiros sobre o melhor momento e forma de plantar suas culturas.

**Vídeo:** [link do YouTube — a adicionar]

---

## Tecnologias

- **Expo** (SDK 56) + **Expo Router** (navegação baseada em arquivos)
- **TypeScript**
- **Firebase Authentication** (Firebase JS SDK — compatível com Expo Go)
- **Axios** com interceptor que injeta o ID Token do Firebase
- **@expo/vector-icons** (Ionicons)
- Fontes **Poppins** (`@expo-google-fonts/poppins`)

> **Sobre o Firebase:** usamos o **Firebase JS SDK** (`firebase`) em vez do
> `@react-native-firebase`. O JS SDK roda no Expo Go e em dev builds sem
> configuração nativa (`google-services.json`), o que simplifica o
> desenvolvimento e a publicação via Firebase App Distribution. O interceptor
> do Axios mantém a mesma lógica pedida na GS, obtendo o token com
> `auth.currentUser?.getIdToken()`.

## Estrutura de pastas

```
/app
  /(auth)      → login.tsx, cadastro.tsx        (rotas públicas)
  /(tabs)      → index, analise, historico, perfil  (rotas protegidas)
  resultado.tsx → recomendação
  iakaru.tsx    → chat com o assistente IAkaru
  _layout.tsx   → layout raiz: fontes, AuthProvider, proteção de rotas
/components    → componentes reutilizáveis
/contexts      → AuthContext (Firebase Authentication)
/services      → api (axios), firebase, culturas, recomendacao, historico, iakaru, mocks
/hooks         → useAuth
/constants     → theme (design system completo)
```

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o Firebase: copie `.env.example` para `.env` e preencha com as
   credenciais do seu projeto (Console do Firebase → Configurações → App Web).
   ```bash
   cp .env.example .env
   ```
3. Inicie o app:
   ```bash
   npx expo start
   ```
   Abra no **Expo Go** (Android/iOS) lendo o QR Code, ou pressione `a`/`i`.

> Sem o `.env` o app abre normalmente, mas as ações de login/cadastro falham
> (precisam de credenciais reais do Firebase).

## Dados mockados

Toda a camada de `services` consome `services/mocks.ts` por enquanto. Cada ponto
de integração está marcado com `// TODO: integrar com API real` (backend
Java Spring Boot / .NET + Gemini).
