# Quiz Anti-Arnaque

Application de quiz interactive pour s'entraîner à détecter les scams, phishing, faux emails et tentatives d'arnaque. Destinée au public français.

## Concept

L'utilisateur est mis en situation face à des messages réels ou simulés (email, SMS, WhatsApp, appel…) et doit déterminer s'il s'agit ou non d'une arnaque. Après chaque réponse, une explication pédagogique détaille les indices à repérer et les risques encourus.

## Format des questions

Trois types de scénarios :
- **Arnaque** : message frauduleux à identifier
- **Légitime** : communication authentique (pour éviter les faux positifs)
- **Suspect** : cas ambigu, enseigne le bon réflexe face à l'incertitude

Et des questions théoriques sur les mécanismes de fraude.

## Canaux couverts

Email, SMS, WhatsApp, appels téléphoniques, QR codes, courriers

## Domaines prioritaires

- Banque et services financiers
- Assurance maladie (Ameli/CPAM)
- Livraison de colis (Chronopost, La Poste, DHL, etc.)
- Amendes (ANTAI, radars)
- Impôts (DGFiP)
- CAF et prestations sociales
- CPF et formation professionnelle
- Télécoms (opérateurs mobile/internet)

## Exigences éditoriales

- Exemples récents, ancrés dans le contexte français
- Derniers modes opératoires connus (leaks de données, usurpation d'identité d'organismes officiels, etc.)
- Niveaux de difficulté : débutant, intermédiaire, avancé

## Phases du projet

1. **Phase actuelle : création des données**
   - Base de questions JSON (`data/scam-quiz-database.json`)
   - Illustrations générées par IA pour chaque question
2. **Phase suivante : implémentation de l'application**
   - Stack à définir

## QA mobile (captures full-page)

Pour vérifier le rendu mobile après sélection d'une réponse (dont l'overlay des indicateurs sur l'image), un test Playwright dédié est disponible.

Commande par défaut (4 premières questions):

```bash
npm run test:e2e:mobile-shots
```

Le test:
- ouvre l'app en viewport `iPhone 13`
- clique sur `Explorer toutes les questions`
- sélectionne la première réponse de chaque question
- capture l'état final en **full-page**

Sortie par défaut:
- `output/playwright/mobile-fullpage/q01-after-answer.png` etc.

Variables optionnelles:

```bash
SCREENSHOT_QUESTION_COUNT=6 SCREENSHOT_OUTPUT_DIR=output/playwright/mobile-v2 npm run test:e2e:mobile-shots
```
