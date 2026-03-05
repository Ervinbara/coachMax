# CoachOS SaaS Universal

Application SaaS cross-platform (Web + iOS + Android) pour coachs sportifs et clients, construite avec un seul codebase Expo + React Native.

## Stack

- React Native
- Expo (SDK 55)
- Expo Router
- TypeScript
- Tamagui (design system)
- Zustand (state management)
- Victory Native (graphiques)
- Supabase client prepare (data mock pour MVP)

## Fonctionnalites MVP

- Login avec selection de role Coach ou Client
- Dashboard Coach (stats + liste clients)
- Fiche client (infos, progression, programme, nutrition, chat)
- Program Builder (UI + mock exercises)
- Nutrition Builder (UI + macros)
- Dashboard Client (objectif, progression, programme, nutrition, chat)
- Bouton upload video (UI only)

## Architecture

```txt
app/
  (auth)/login.tsx
  (coach)/dashboard.tsx
  (coach)/clients.tsx
  (coach)/client-detail.tsx
  (coach)/program-builder.tsx
  (coach)/nutrition-builder.tsx
  (client)/dashboard.tsx
  (client)/program.tsx
  (client)/nutrition.tsx
  (client)/progress.tsx
  (client)/chat.tsx

src/
  components/
  layout/
  features/
  hooks/
  mocks/
  services/
  lib/
```

## Installation

```bash
npm install
```

## Lancer l'application

```bash
npm run web
```

```bash
npx expo start
```

## Supabase (preparation)

1. Copier `.env.example` vers `.env`
2. Renseigner les cles:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - (option Expo) `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Le client est initialise dans `src/lib/supabaseClient.ts`
4. Les ecrans utilisent encore des donnees mock dans `src/mocks/*`
