#!/usr/bin/env python3
"""
generate_quiz_images.py
-----------------------
Génère les illustrations du quiz anti-arnaque via l'API Nano Banana
(nanobananapro.cloud).

Usage :
    python generate_quiz_images.py --api-key YOUR_KEY [options]

Options :
    --api-key       Clé API Nano Banana (obligatoire)
    --db            Chemin vers le fichier JSON du quiz (défaut: scam-quiz-database.json)
    --output-dir    Dossier de sortie pour les images (défaut: quiz_images/)
    --model         Modèle Nano Banana (défaut: nano-banana-2)
    --image-size    Résolution : 1K, 2K, 4K (défaut: 1K)
    --aspect-ratio  Ratio d'image (défaut: 16:9)
    --questions     IDs des questions à générer, séparés par des virgules (défaut: toutes)
    --dry-run       Affiche les prompts sans appeler l'API
    --delay         Délai en secondes entre chaque requête (défaut: 2)
    --poll-interval Intervalle de polling en secondes (défaut: 5)
    --max-polls     Nombre max de tentatives de polling (défaut: 60)
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
import urllib.parse

# ──────────────────────────────────────────────────────────────
# Configuration API
# ──────────────────────────────────────────────────────────────
API_BASE = "https://nanobananapro.cloud"
ENDPOINT_GENERATE = f"{API_BASE}/api/v1/image/nano-banana"
ENDPOINT_RESULT = f"{API_BASE}/api/v1/image/nano-banana/result"

# ──────────────────────────────────────────────────────────────
# Prompt de base (tel que spécifié par Thomas)
# ──────────────────────────────────────────────────────────────
BASE_PROMPT = (
    "Génère une image qui sera utilisée dans un quiz pour former à la sécurité. "
    "Le contenu doit permettre de mettre le joueur en situation, mais il n'y a pas "
    "besoin que l'illustration soit photo réaliste. Inutile d'ajouter des éléments "
    "d'interface, il s'agit de l'illustration uniquement. Suivre strictement le "
    "scénario, ne pas inventer ou ajouter des éléments ou indices additionnels."
)


def build_prompt(question: dict) -> str:
    """Construit le prompt complet en combinant le prompt de base et le scénario."""
    scenario = question.get("scenario", {})
    scenario_json = json.dumps(scenario, ensure_ascii=False, indent=2)

    # Ajouter le contexte du canal et de la catégorie pour guider le style
    channel = question.get("channel", "")
    category = question.get("category", "")
    title = question.get("title", "")

    prompt = (
        f"{BASE_PROMPT}\n\n"
        f"--- Contexte ---\n"
        f"Titre de la question : {title}\n"
        f"Canal : {channel}\n"
        f"Catégorie : {category}\n\n"
        f"--- Scénario ---\n"
        f"{scenario_json}"
    )
    return prompt


def generate_filename(question: dict) -> str:
    """Génère un nom de fichier lisible à partir de l'ID et du titre."""
    qid = question["id"]
    # Slugifier le titre
    title = question.get("title", "question")
    slug = title.lower()
    # Remplacer les caractères spéciaux
    replacements = {
        " ": "_", "'": "", "'": "", "—": "-", "–": "-",
        ":": "", "/": "-", "\\": "-", "(": "", ")": "",
        "é": "e", "è": "e", "ê": "e", "ë": "e",
        "à": "a", "â": "a", "ä": "a",
        "ù": "u", "û": "u", "ü": "u",
        "î": "i", "ï": "i",
        "ô": "o", "ö": "o",
        "ç": "c",
    }
    for old, new in replacements.items():
        slug = slug.replace(old, new)
    # Nettoyer les caractères restants
    slug = "".join(c for c in slug if c.isalnum() or c in "-_")
    # Tronquer si trop long
    slug = slug[:60].rstrip("_-")
    return f"q{qid:02d}_{slug}.png"


def api_request(url: str, data: dict, api_key: str) -> dict:
    """Envoie une requête POST JSON à l'API."""
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"  ✗ Erreur HTTP {e.code}: {error_body}", file=sys.stderr)
        return {"code": e.code, "message": error_body, "data": None}
    except Exception as e:
        print(f"  ✗ Erreur réseau: {e}", file=sys.stderr)
        return {"code": -1, "message": str(e), "data": None}


def api_multipart(url: str, fields: dict, api_key: str) -> dict:
    """Envoie une requête POST multipart/form-data à l'API."""
    boundary = "----NanoBananaQuizBoundary"
    body_parts = []
    for key, value in fields.items():
        body_parts.append(f"--{boundary}".encode())
        body_parts.append(
            f'Content-Disposition: form-data; name="{key}"\r\n'.encode()
        )
        body_parts.append(str(value).encode("utf-8"))
    body_parts.append(f"--{boundary}--".encode())
    body = b"\r\n".join(body_parts)

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"  ✗ Erreur HTTP {e.code}: {error_body}", file=sys.stderr)
        return {"code": e.code, "message": error_body, "data": None}
    except Exception as e:
        print(f"  ✗ Erreur réseau: {e}", file=sys.stderr)
        return {"code": -1, "message": str(e), "data": None}


def submit_generation(prompt: str, api_key: str, model: str,
                      image_size: str, aspect_ratio: str) -> str | None:
    """Soumet une tâche de génération. Retourne le task ID ou None."""
    fields = {
        "prompt": prompt,
        "model": model,
        "mode": "text-to-image",
        "aspectRatio": aspect_ratio,
        "imageSize": image_size,
        "outputFormat": "png",
        "isPublic": "false",
    }
    resp = api_multipart(ENDPOINT_GENERATE, fields, api_key)
    if resp.get("code") == 0 and resp.get("data"):
        task_id = resp["data"].get("id")
        credits = resp["data"].get("credits_cost", "?")
        print(f"  → Tâche soumise: {task_id} (coût: {credits} crédits)")
        return task_id
    else:
        print(f"  ✗ Échec soumission: {resp.get('message', 'inconnu')}")
        return None


def poll_result(task_id: str, api_key: str,
                poll_interval: int, max_polls: int) -> str | None:
    """Poll le résultat jusqu'à succès/échec. Retourne l'URL de l'image ou None."""
    for attempt in range(1, max_polls + 1):
        time.sleep(poll_interval)
        resp = api_request(ENDPOINT_RESULT, {"taskId": task_id}, api_key)

        if resp.get("code") != 0 or not resp.get("data"):
            print(f"  ⏳ Poll #{attempt}: erreur API, nouvelle tentative...")
            continue

        data = resp["data"]
        status = data.get("status", "unknown")
        progress = data.get("progress", 0)

        if status == "succeeded":
            results = data.get("results", [])
            if results and results[0].get("url"):
                print(f"  ✓ Terminé ! ({progress}%)")
                return results[0]["url"]
            else:
                print(f"  ✗ Succès mais pas d'URL dans la réponse")
                return None

        elif status == "failed":
            reason = data.get("failure_reason", "raison inconnue")
            print(f"  ✗ Échec de génération: {reason}")
            return None

        else:
            # Encore en cours
            bar = "█" * (progress // 5) + "░" * (20 - progress // 5)
            print(f"  ⏳ Poll #{attempt}: {status} [{bar}] {progress}%",
                  end="\r", flush=True)

    print(f"\n  ✗ Timeout après {max_polls} tentatives")
    return None


def download_image(url: str, filepath: str) -> bool:
    """Télécharge une image depuis une URL."""
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            with open(filepath, "wb") as f:
                f.write(resp.read())
        size_kb = os.path.getsize(filepath) / 1024
        print(f"  💾 Sauvegardé: {filepath} ({size_kb:.0f} Ko)")
        return True
    except Exception as e:
        print(f"  ✗ Erreur téléchargement: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Génère les illustrations du quiz anti-arnaque via Nano Banana API"
    )
    parser.add_argument("--api-key", required=True, help="Clé API Nano Banana")
    parser.add_argument("--db", default="scam-quiz-database.json",
                        help="Chemin vers le fichier JSON du quiz")
    parser.add_argument("--output-dir", default="quiz_images",
                        help="Dossier de sortie pour les images")
    parser.add_argument("--model", default="nano-banana-2",
                        choices=["nano-banana-fast", "nano-banana", "nano-banana-pro",
                                 "nano-banana-vip", "nano-banana-pro-vip", "nano-banana-2"],
                        help="Modèle à utiliser")
    parser.add_argument("--image-size", default="1K", choices=["1K", "2K", "4K"],
                        help="Résolution des images")
    parser.add_argument("--aspect-ratio", default="16:9",
                        help="Ratio d'image (ex: 16:9, 1:1, 9:16)")
    parser.add_argument("--questions", default=None,
                        help="IDs des questions à générer, séparés par des virgules (ex: 1,3,5)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Affiche les prompts sans appeler l'API")
    parser.add_argument("--delay", type=int, default=2,
                        help="Délai entre chaque requête (secondes)")
    parser.add_argument("--poll-interval", type=int, default=5,
                        help="Intervalle de polling (secondes)")
    parser.add_argument("--max-polls", type=int, default=60,
                        help="Nombre max de tentatives de polling")

    args = parser.parse_args()

    # Charger la base de données
    if not os.path.exists(args.db):
        print(f"✗ Fichier introuvable: {args.db}")
        sys.exit(1)

    with open(args.db, "r", encoding="utf-8") as f:
        db = json.load(f)

    questions = db["questions"]
    print(f"📋 Base de données chargée: {len(questions)} questions")

    # Filtrer les questions si demandé
    if args.questions:
        target_ids = set(int(x.strip()) for x in args.questions.split(","))
        questions = [q for q in questions if q["id"] in target_ids]
        print(f"🎯 Filtre appliqué: {len(questions)} questions sélectionnées")

    # Créer le dossier de sortie
    os.makedirs(args.output_dir, exist_ok=True)

    # Préparer le manifest pour associer images aux questions
    manifest = {}
    results_summary = {"success": 0, "failed": 0, "skipped": 0}

    print(f"\n🎨 Modèle: {args.model} | Résolution: {args.image_size} | Ratio: {args.aspect_ratio}")
    print(f"📁 Dossier de sortie: {args.output_dir}/")
    print("=" * 70)

    for i, question in enumerate(questions, 1):
        qid = question["id"]
        title = question["title"]
        filename = generate_filename(question)
        filepath = os.path.join(args.output_dir, filename)

        print(f"\n[{i}/{len(questions)}] Q{qid}: {title}")

        # Vérifier si l'image existe déjà
        if os.path.exists(filepath):
            print(f"  ⏭  Image existante, skip ({filename})")
            manifest[qid] = filename
            results_summary["skipped"] += 1
            continue

        # Construire le prompt
        prompt = build_prompt(question)

        if args.dry_run:
            print(f"  📝 Prompt ({len(prompt)} chars):")
            print(f"     {prompt[:200]}...")
            print(f"  📄 Fichier: {filename}")
            manifest[qid] = filename
            results_summary["skipped"] += 1
            continue

        # Soumettre la génération
        task_id = submit_generation(
            prompt, args.api_key, args.model,
            args.image_size, args.aspect_ratio
        )

        if not task_id:
            results_summary["failed"] += 1
            continue

        # Attendre le résultat
        image_url = poll_result(task_id, args.api_key,
                                args.poll_interval, args.max_polls)

        if not image_url:
            results_summary["failed"] += 1
            continue

        # Télécharger l'image
        if download_image(image_url, filepath):
            manifest[qid] = filename
            results_summary["success"] += 1
        else:
            results_summary["failed"] += 1

        # Délai entre les requêtes pour ne pas surcharger l'API
        if i < len(questions):
            time.sleep(args.delay)

    # Sauvegarder le manifest
    manifest_path = os.path.join(args.output_dir, "manifest.json")
    manifest_data = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model": args.model,
        "image_size": args.image_size,
        "aspect_ratio": args.aspect_ratio,
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

    # Mettre à jour la base de données avec les chemins d'images
    db_updated = False
    for question in db["questions"]:
        qid = question["id"]
        if qid in manifest:
            question["illustration"] = {
                "filename": manifest[qid],
                "path": f"{args.output_dir}/{manifest[qid]}",
                "model": args.model,
                "generated_at": manifest_data["generated_at"],
            }
            db_updated = True

    if db_updated:
        updated_db_path = args.db.replace(".json", "_with_images.json")
        with open(updated_db_path, "w", encoding="utf-8") as f:
            json.dump(db, f, ensure_ascii=False, indent=2)
        print(f"\n📝 Base de données mise à jour: {updated_db_path}")

    # Résumé
    print("\n" + "=" * 70)
    print("📊 Résumé:")
    print(f"   ✓ Réussies:  {results_summary['success']}")
    print(f"   ✗ Échouées:  {results_summary['failed']}")
    print(f"   ⏭  Skippées: {results_summary['skipped']}")
    print(f"   📁 Manifest: {manifest_path}")
    print(f"   🖼  Images:   {args.output_dir}/")

    if results_summary["failed"] > 0:
        print(f"\n💡 Relancez avec --questions pour regénérer les images manquantes")
        failed_ids = [
            str(q["id"]) for q in questions
            if q["id"] not in manifest
        ]
        if failed_ids:
            print(f"   python {sys.argv[0]} --api-key YOUR_KEY --questions {','.join(failed_ids)}")


if __name__ == "__main__":
    main()
