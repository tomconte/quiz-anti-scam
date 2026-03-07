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
# quiz-anti-scam
