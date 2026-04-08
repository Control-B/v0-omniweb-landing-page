import os
import sys
from pathlib import Path

from openai import OpenAI
from dotenv import load_dotenv


def main() -> int:
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    if env_path.exists():
        load_dotenv(env_path, override=False)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY is not set")
        return 1

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model="gpt-5-nano",
        input="write a haiku about ai",
        store=False,
    )
    print(response.output_text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())