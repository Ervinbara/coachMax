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

## Invitations coach -> client (email + fallback manuel)

Configuration `.env`:

- `EXPO_PUBLIC_APP_BASE_URL` (ex: `http://localhost:8081`)
- `EXPO_PUBLIC_INVITE_EMAIL_PROVIDER`:
  - `disabled` (par defaut, pas d'envoi auto)
  - `supabase-function` (recommande: logique email cote serveur)
  - `webhook` (Brevo/Mailjet via endpoint intermediaire)
- `EXPO_PUBLIC_INVITE_EMAIL_WEBHOOK_URL` (obligatoire si mode `webhook`)

Comportement:

- L'invitation est toujours creee en base.
- L'envoi email est tente selon le provider.
- Si l'envoi auto ne fonctionne pas, le coach peut copier/partager un texte d'invitation pret a envoyer manuellement.

### Provider serveur Brevo/Mailjet (pret a brancher)

La fonction Supabase `send-invitation-email` est prete dans:

- `supabase/functions/send-invitation-email/index.ts`

Choix provider (secret serveur, pas public):

- `INVITE_EMAIL_PROVIDER=brevo`
- ou `INVITE_EMAIL_PROVIDER=mailjet`
- ou `INVITE_EMAIL_PROVIDER=disabled`

Secrets Brevo:

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`

Secrets Mailjet:

- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAILJET_SENDER_EMAIL`
- `MAILJET_SENDER_NAME`

Deploiement:

```bash
npx supabase functions deploy send-invitation-email
```

Configuration secrets (exemple):

```bash
npx supabase secrets set INVITE_EMAIL_PROVIDER=brevo BREVO_API_KEY=xxx BREVO_SENDER_EMAIL=no-reply@coachflow.app BREVO_SENDER_NAME=CoachFlow
```
