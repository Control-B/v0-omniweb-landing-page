import argparse
import base64
import json
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


GLOBAL_IMAGE_DIRECTION = """
You are a world-class commercial photographer and art director.

Generate ultra high-quality, production-ready images for modern websites.

STRICT REQUIREMENTS:
- Photorealistic rendering with physically accurate lighting
- Professional composition using rule of thirds or centered hero framing
- Clean, uncluttered backgrounds suitable for web UI overlays
- High dynamic range (HDR), balanced exposure, no blown highlights
- Natural color grading, no oversaturation
- Sharp focus with realistic depth of field, DSLR quality
- Real-world materials and textures, no plastic or artificial look
- Lighting must match environment with consistent shadows and reflections

STYLE CONSISTENCY:
- Maintain consistent visual identity across multiple images
- Keep similar color palette, lighting style, and tone across a series
- Avoid randomness in subject appearance when generating related assets

OUTPUT QUALITY:
- 4K to 8K detail equivalent
- No artifacts, no distortion, no warped objects
- Clean edges for easy cropping in responsive layouts

COMPOSITION RULES:
- Leave negative space for web headline and CTA overlays
- Use clear depth layering: foreground, subject, background
""".strip()


STYLE_PROFILES = {
    "service_business": """
STYLE:
- Modern service business branding
- Trustworthy, professional, local-business feel
- Natural outdoor lighting, golden hour or soft daylight
- Subtle warm tones with restrained orange-blue contrast
- Real workers, realistic uniforms, branded service vehicles where relevant
- Clean suburban or commercial environments
""".strip(),
    "product_photography": """
STYLE:
- Premium product photography
- Studio lighting with soft, believable shadows
- Neutral or subtle gradient backgrounds
- Minimalist, Apple-style aesthetic
- Focus on product clarity, material detail, and premium finish
- Symmetry or centered hero composition unless overridden
""".strip(),
    "futuristic_saas": """
STYLE:
- Futuristic but clean
- Soft gradients and glassmorphism-inspired surfaces
- Cool tones with blue and purple accents
- Abstract environments or modern office scenes
- Subtle glow lighting and premium technology atmosphere
""".strip(),
}


DEFAULT_NEGATIVE_CONSTRAINTS = [
    "no text",
    "no logos",
    "no watermark",
    "no interface gibberish",
    "no distorted anatomy",
    "no warped geometry",
]


def load_manifest(manifest_path: Path) -> list[dict]:
    data = json.loads(manifest_path.read_text())
    if not isinstance(data, list):
        raise ValueError("Manifest must be a JSON array")
    return data


def load_video_manifest(manifest_path: Path) -> list[dict]:
    data = json.loads(manifest_path.read_text())
    if not isinstance(data, list):
        raise ValueError("Video manifest must be a JSON array")
    return data


def normalize_text(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def build_image_prompt(item: dict) -> str:
    style_profile = item.get("style_profile", "futuristic_saas")
    style_text = STYLE_PROFILES.get(style_profile, style_profile)
    negative_constraints = list(DEFAULT_NEGATIVE_CONSTRAINTS)
    negative_constraints.extend(item.get("negative_constraints", []))

    sections = [GLOBAL_IMAGE_DIRECTION]
    if style_text:
        sections.append(style_text)

    legacy_prompt = normalize_text(item.get("prompt"))
    if legacy_prompt:
        sections.append(f"PROJECT BRIEF:\n{legacy_prompt}")

    scene = normalize_text(item.get("scene"))
    if scene:
        sections.append(f"SCENE:\n{scene}")

    environment = normalize_text(item.get("environment"))
    if environment:
        sections.append(f"ENVIRONMENT:\n{environment}")

    camera = item.get("camera") or []
    if camera:
        sections.append("CAMERA:\n" + "\n".join(f"- {entry}" for entry in camera))

    lighting = item.get("lighting") or []
    if lighting:
        sections.append("LIGHTING:\n" + "\n".join(f"- {entry}" for entry in lighting))

    mood = normalize_text(item.get("mood"))
    if mood:
        sections.append(f"MOOD:\n{mood}")

    composition = item.get("composition") or []
    if composition:
        sections.append("COMPOSITION:\n" + "\n".join(f"- {entry}" for entry in composition))

    continuity = normalize_text(item.get("series_continuity"))
    if continuity:
        sections.append(f"SERIES CONTINUITY:\n{continuity}")

    prompt_suffix = normalize_text(item.get("prompt_suffix"))
    if prompt_suffix:
        sections.append(f"ADDITIONAL DIRECTION:\n{prompt_suffix}")

    if negative_constraints:
        deduped_constraints = list(dict.fromkeys(negative_constraints))
        sections.append("AVOID:\n" + "\n".join(f"- {entry}" for entry in deduped_constraints))

    return "\n\n".join(section for section in sections if section)


def generate_image(
    client: OpenAI,
    prompt: str,
    model: str,
    size: str,
    quality: str,
    output_format: str,
) -> bytes:
    result = client.images.generate(
        model=model,
        prompt=prompt,
        size=size,
        quality=quality,
        output_format=output_format,
    )
    image_base64 = result.data[0].b64_json
    if not image_base64:
        raise RuntimeError("Image API returned no base64 payload")
    return base64.b64decode(image_base64)


def main() -> int:
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent
    load_dotenv(repo_root / ".env.local", override=False)

    parser = argparse.ArgumentParser(description="Generate curated website images with OpenAI")
    parser.add_argument("--manifest", default=str(script_dir / "website_image_prompts.json"))
    parser.add_argument("--output-dir", default=str(repo_root / "public" / "images" / "generated"))
    parser.add_argument("--video-manifest", default=str(script_dir / "website_video_prompts.json"))
    parser.add_argument("--video-output-dir", default=str(repo_root / "public" / "media" / "generated"))
    parser.add_argument("--model", default="gpt-image-1")
    parser.add_argument("--quality", default="high")
    parser.add_argument("--output-format", default="png")
    parser.add_argument("--video-model", default=None)
    parser.add_argument("--skip-videos", action="store_true")
    parser.add_argument("--skip-images", action="store_true")
    parser.add_argument("--dry-run-prompts", action="store_true", help="Print resolved prompts without calling the image API")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", nargs="*", help="Optional image ids to generate")
    parser.add_argument("--only-videos", nargs="*", help="Optional video ids to generate")
    args = parser.parse_args()

    client = OpenAI()
    manifest = load_manifest(Path(args.manifest))
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    video_manifest_path = Path(args.video_manifest)
    video_manifest = load_video_manifest(video_manifest_path) if video_manifest_path.exists() else []
    video_output_dir = Path(args.video_output_dir)
    video_output_dir.mkdir(parents=True, exist_ok=True)

    selected_ids = set(args.only or [])
    selected_video_ids = set(args.only_videos or [])
    failed_images: list[str] = []
    failed_videos: list[str] = []

    if not args.skip_images:
        for item in manifest:
            image_id = item["id"]
            if selected_ids and image_id not in selected_ids:
                continue

            prompt = build_image_prompt(item)

            if args.dry_run_prompts:
                print(f"--- prompt {image_id} ---")
                print(prompt)
                print()
                continue

            output_path = output_dir / item["filename"]
            if output_path.exists() and not args.force:
                print(f"skip {image_id}: {output_path.name} already exists")
                continue

            print(f"generating image {image_id} -> {output_path.name}")
            try:
                image_bytes = generate_image(
                    client=client,
                    prompt=prompt,
                    model=args.model,
                    size=item.get("size", "1536x1024"),
                    quality=item.get("quality", args.quality),
                    output_format=item.get("output_format", args.output_format),
                )
                output_path.write_bytes(image_bytes)
            except Exception as exc:
                failed_images.append(image_id)
                print(f"error image {image_id}: {exc}")

    if not args.skip_videos:
        for item in video_manifest:
            video_id = item["id"]
            if selected_video_ids and video_id not in selected_video_ids:
                continue

            output_path = video_output_dir / item["filename"]
            if output_path.exists() and not args.force:
                print(f"skip {video_id}: {output_path.name} already exists")
                continue

            print(f"generating video {video_id} -> {output_path.name}")
            try:
                video = client.videos.create_and_poll(
                    prompt=item["prompt"],
                    model=args.video_model or item.get("model"),
                    seconds=item.get("seconds"),
                    size=item.get("size"),
                )
                content = client.videos.download_content(video.id)
                output_path.write_bytes(content.content)
            except Exception as exc:
                failed_videos.append(video_id)
                print(f"error video {video_id}: {exc}")

    print(f"done: images available in {output_dir}; videos available in {video_output_dir}")
    if failed_images:
        print("failed images: " + ", ".join(failed_images))
    if failed_videos:
        print("failed videos: " + ", ".join(failed_videos))
    return 1 if failed_images or failed_videos else 0


if __name__ == "__main__":
    raise SystemExit(main())