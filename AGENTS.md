# Quiz Anti-Arnaque — Notes techniques

## Fichiers clés

- `data/scam-quiz-database.json` — base de données unifiée (source de vérité)
- `data/quiz_images/` — illustrations générées par IA (une par question)
- `data/quiz_images/manifest.json` — index images ↔ questions
- `scripts/generate_quiz_images_gemini.py` — script de génération d'illustrations

## État actuel

- 30 questions dans `scam-quiz-database.json` (v2.0)
- 30 images générées dans `data/quiz_images/` (Q1-Q30)
- Distribution : 14 arnaque, 7 légitime, 3 suspect, 6 théorie (verdict=null)

## Schéma JSON des questions (v2.0)

Champs communs à toutes les questions :

```json
{
  "id": 1,
  "type": "scenario_visuel | theorie | vrai_ou_faux | indice_a_reperer",
  "category": "banque | livraison_colis | impots | assurance_maladie | amendes | whatsapp_sms | caf_prestations | cpf_formation | telecom | theorie_generale",
  "channel": "email | sms | whatsapp | appel | qr_code | courrier",
  "difficulty": "debutant | intermediaire | avance",
  "verdict": "arnaque | legitime | suspect | null",
  "title": "...",
  "scenario": { "description": "...", "simulated_content": {} },
  "question": "...",
  "options": [{ "id": "A", "text": "...", "is_correct": false }],
  "correct_answer": "A",
  "indicators": ["..."],
  "explanation": "...",
  "source_context": "..."
}
```

Champs optionnels selon le type :

| Champ | Présent sur |
|---|---|
| `pairs_with` | Questions légitimes/suspects (id de la question miroir) |
| `key_lesson` | Questions légitimes/suspects (Q21+) |
| `risks` | Questions arnaque (Q1-Q20) |
| `official_verification` | Questions arnaque (Q1-Q20) |

Note : `indicators` est le champ unifié qui remplace `red_flags` (arnaques), `legitimacy_markers` (légitimes) et `ambiguity_factors` (suspects) des anciens formats.

## Génération d'images

Outil : `scripts/generate_quiz_images_gemini.py`
Dépendance : `google-genai` (chargée via `uv run --with google-genai`)
Modèle : `gemini-3-pro-image-preview`
API key : variable d'environnement `GEMINI_API_KEY` (dans `.env`)
Prérequis : compte Google AI Studio avec **billing activé** (Imagen et modèles image non disponibles en free tier)

```bash
# Générer toutes les images manquantes
export $(cat .env | xargs) && uv run --with google-genai scripts/generate_quiz_images_gemini.py

# Générer des questions spécifiques
uv run --with google-genai scripts/generate_quiz_images_gemini.py --questions 1,5,10

# Dry-run (affiche les prompts sans appeler l'API)
uv run --with google-genai scripts/generate_quiz_images_gemini.py --dry-run
```

Le script skipe automatiquement les images déjà présentes dans `data/quiz_images/`.
Après génération, il met à jour `data/scam-quiz-database_with_images.json` et le manifest.

## Conventions de nommage des images

`q{id:02d}_{slug_du_titre}.png` — ex: `q01_sms_de_livraison_chronopost.png`
