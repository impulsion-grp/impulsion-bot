# Impulsion Bot V10 complet

Version propre complète pour éviter les patchs compliqués dans l'ancien bot.

## Inclus

- `/idee` : créer, lister, détailler, changer statut, valider une idée
- Validation idée → création automatique rôle + catégorie + salons projet
- `/projet` : créer/lister/détailler
- `/tache` : créer/lister/changer statut
- `/music` : play/stop simple
- `/docs` : afficher/publier la documentation
- `/veille` : rapport quotidien IA & Développement Web avec OpenAI API
- Message de bienvenue
- Automatisations : digest, rappel idées, projets inactifs

## Installation

```bash
npm install
cp .env.example .env
npm run deploy
npm run dev
```

Variables minimum à remplir :

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
OPENAI_API_KEY=
INTELLIGENCE_REPORT_DISCORD_CHANNEL_ID=
```

## Structure

Toutes les commandes sont centralisées dans :

```text
src/commands/index.ts
```

Le déploiement et le handler utilisent le même registre.
Tu ne dois plus chercher une constante `commands` cachée ailleurs.

## Données

```text
data/store.json
data/reports/
```
