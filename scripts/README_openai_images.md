# OpenAI Website Images

Generate curated website visuals into `public/images/generated`.

The generator now builds prompts from a shared commercial-photography direction plus optional structured fields in `scripts/website_image_prompts.json` such as `style_profile`, `scene`, `environment`, `camera`, `lighting`, `mood`, and `composition`. This keeps the image series more consistent and improves hero-grade output quality.

## Run

```bash
/root/v0-omniweb-landing-page/ai/.venv/bin/python /root/v0-omniweb-landing-page/scripts/generate_website_images.py
```

This also generates short video clips into `public/media/generated` unless you pass `--skip-videos`.

## Regenerate specific images

```bash
/root/v0-omniweb-landing-page/ai/.venv/bin/python /root/v0-omniweb-landing-page/scripts/generate_website_images.py --force --only solutions-ecommerce resources-knowledge-hub
```

## Preview the resolved prompt without spending tokens

```bash
/root/v0-omniweb-landing-page/ai/.venv/bin/python /root/v0-omniweb-landing-page/scripts/generate_website_images.py --skip-videos --dry-run-prompts --only company-innovation-team
```

## Videos only

```bash
/root/v0-omniweb-landing-page/ai/.venv/bin/python /root/v0-omniweb-landing-page/scripts/generate_website_images.py --skip-images --only-videos resources-platform-overview resources-ai-copywriting resources-lead-generation
```

The script reads `OPENAI_API_KEY` from the repo root `.env.local`.