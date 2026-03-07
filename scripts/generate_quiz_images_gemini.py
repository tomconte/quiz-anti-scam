#!/usr/bin/env python3
"""
generate_quiz_images_gemini.py
------------------------------
Génère les illustrations du quiz anti-arnaque via l'API Google Imagen
(google-genai SDK).

Usage :
    uv run --with google-genai generate_quiz_images_gemini.py [options]

Options :
    --api-key       Clé API Google Gemini (ou via GEMINI_API_KEY)
    --db            Chemin vers le fichier JSON du quiz (défaut: data/scam-quiz-database.json)
    --output-dir    Dossier de sortie pour les images (défaut: data/quiz_images/)
    --model         Modèle Imagen (défaut: imagen-3.0-generate-001)
    --questions     IDs des questions à générer, séparés par des virgules (défaut: toutes)
    --dry-run       Affiche les prompts sans appeler l'API
    --delay         Délai en secondes entre chaque requête (défaut: 2)
"""

import argparse
import json
import os
import sys
import time

BASE_PROMPT = (
    "Génère une image qui sera utilisée dans un quiz pour former à la sécurité "
    "informatique et à la détection d'arnaques. "
    "Le contenu doit permettre de mettre le joueur en situation. "
    "L'illustration n'a pas besoin d'être photo-réaliste. "
    "Ne pas ajouter d'éléments d'interface superflus — il s'agit de l'illustration uniquement. "
    "Suivre strictement le scénario, sans inventer ni ajouter d'indices ou d'éléments additionnels."
)


def build_prompt(question: dict) -> str:
    scenario = question.get("scenario", {})
    scenario_json = json.dumps(scenario, ensure_ascii=False, indent=2)
    channel = question.get("channel", "")
    category = question.get("category", "")
    title = question.get("title", "")

    return (
        f"{BASE_PROMPT}\n\n"
        f"--- Contexte ---\n"
        f"Titre : {title}\n"
        f"Canal : {channel}\n"
        f"Catégorie : {category}\n\n"
        f"--- Scénario ---\n"
        f"{scenario_json}"
    )


def generate_filename(question: dict) -> str:
    qid = question["id"]
    title = question.get("title", "question")
    slug = title.lower()
    replacements = {
        " ": "_", "'": "", "\u2019": "", "\u2014": "-", "\u2013": "-",
        ":": "", "/": "-", "\\": "-", "(": "", ")": "",
        "\xe9": "e", "\xe8": "e", "\xea": "e", "\xeb": "e",
        "\xe0": "a", "\xe2": "a", "\xe4": "a",
        "\xf9": "u", "\xfb": "u", "\xfc": "u",
        "\xee": "i", "\xef": "i",
        "\xf4": "o", "\xf6": "o",
        "\xe7": "c",
    }
    for old, new in replacements.items():
        slug = slug.replace(old, new)
    slug = "".join(c for c in slug if c.isalnum() or c in "-_")
    slug = slug[:60].rstrip("_-")
    return f"q{qid:02d}_{slug}.png"


def generate_image(client, prompt: str, model: str, filepath: str) -> bool:
    from google.genai import types

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        # Chercher une partie image dans la réponse
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                with open(filepath, "wb") as f:
                    f.write(part.inline_data.data)
                size_kb = os.path.getsize(filepath) / 1024
                print(f"  OK Sauvegarde: {filepath} ({size_kb:.0f} Ko)")
                return True

        print("  x Aucune image dans la réponse")
        return False

    except Exception as e:
        print(f"  x Erreur génération: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Génère les illustrations du quiz via Google Imagen"
    )
    parser.add_argument("--api-key", default=None, help="Clé API Google (ou GEMINI_API_KEY)")
    parser.add_argument("--db", default="data/scam-quiz-database.json")
    parser.add_argument("--output-dir", default="data/quiz_images")
    parser.add_argument("--model", default="gemini-3-pro-image-preview")
    parser.add_argument("--questions", default=None,
                        help="IDs séparés par des virgules (ex: 1,3,5)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--delay", type=int, default=2)
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("x Clé API manquante : --api-key ou GEMINI_API_KEY", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(args.db):
        print(f"x Fichier introuvable: {args.db}", file=sys.stderr)
        sys.exit(1)

    with open(args.db, "r", encoding="utf-8") as f:
        db = json.load(f)

    questions = db["questions"]
    print(f"Base chargée: {len(questions)} questions")

    if args.questions:
        target_ids = set(int(x.strip()) for x in args.questions.split(","))
        questions = [q for q in questions if q["id"] in target_ids]
        print(f"Filtre: {len(questions)} questions sélectionnées")

    os.makedirs(args.output_dir, exist_ok=True)

    if not args.dry_run:
        from google import genai
        client = genai.Client(api_key=api_key)
    else:
        client = None

    manifest = {}
    results = {"success": 0, "failed": 0, "skipped": 0}

    print(f"Modèle: {args.model} | Sortie: {args.output_dir}/")
    print("=" * 60)

    for i, question in enumerate(questions, 1):
        qid = question["id"]
        title = question["title"]
        filename = generate_filename(question)
        filepath = os.path.join(args.output_dir, filename)

        print(f"\n[{i}/{len(questions)}] Q{qid}: {title}")

        if os.path.exists(filepath):
            print(f"  -- Déjà générée, skip")
            manifest[qid] = filename
            results["skipped"] += 1
            continue

        prompt = build_prompt(question)

        if args.dry_run:
            print(f"  [DRY-RUN] Prompt ({len(prompt)} chars):")
            print(f"  {prompt[:200]}...")
            print(f"  Fichier: {filename}")
            manifest[qid] = filename
            results["skipped"] += 1
            continue

        if generate_image(client, prompt, args.model, filepath):
            manifest[qid] = filename
            results["success"] += 1
        else:
            results["failed"] += 1

        if i < len(questions):
            time.sleep(args.delay)

    # Manifest
    manifest_path = os.path.join(args.output_dir, "manifest.json")
    manifest_data = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model": args.model,
        "images": {
            str(qid): {
                "filename": fname,
                "question_title": next(
                    (q["title"] for q in db["questions"] if q["id"] == qid), ""
                ),
            }
            for qid, fname in sorted(manifest.items())
        },
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, ensure_ascii=False, indent=2)

    # Mise à jour de la DB
    for question in db["questions"]:
        qid = question["id"]
        if qid in manifest:
            question["illustration"] = {
                "filename": manifest[qid],
                "path": f"{args.output_dir}/{manifest[qid]}",
                "model": args.model,
                "generated_at": manifest_data["generated_at"],
            }

    updated_db_path = args.db.replace(".json", "_with_images.json")
    with open(updated_db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print(f"\nDB mise à jour: {updated_db_path}")

    print("\n" + "=" * 60)
    print(f"OK : {results['success']}  |  Echec : {results['failed']}  |  Skip : {results['skipped']}")
    print(f"Manifest: {manifest_path}")

    if results["failed"] > 0:
        failed_ids = [str(q["id"]) for q in questions if q["id"] not in manifest]
        print(f"\nRelancer avec --questions {','.join(failed_ids)}")


if __name__ == "__main__":
    main()
