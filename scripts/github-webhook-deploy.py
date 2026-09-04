#!/usr/bin/env python3
"""
Omniweb AI — Lightweight GitHub Webhook CI/CD Receiver
Listens for GitHub push events on 'main', verifies HMAC-SHA256 signature,
and triggers Docker Compose rebuilds on GCP VM with zero external SaaS cost.
"""

import hmac
import hashlib
import json
import os
import subprocess
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys

PORT = int(os.environ.get("WEBHOOK_PORT", 9000))
REPO_DIR = os.path.expanduser(os.environ.get("REPO_DIR", "/home/banjahmarah/v0-omniweb-landing-page"))
LOG_FILE = os.path.join(REPO_DIR, "deploy.log")
SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET", "omniweb_ci_deploy_secret_2026").encode("utf-8")

# If secret is set in .env.gcp, load it
env_gcp_path = os.path.join(REPO_DIR, ".env.gcp")
if os.path.exists(env_gcp_path):
    with open(env_gcp_path, "r") as f:
        for line in f:
            if line.startswith("GITHUB_WEBHOOK_SECRET="):
                val = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                if val:
                    SECRET = val.encode("utf-8")


def log_event(message: str):
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    formatted = f"[{timestamp}] {message}\n"
    print(formatted, end="", flush=True)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(formatted)
    except Exception as e:
        print(f"Failed writing to log file: {e}")


def execute_deployment(commit_sha: str, author: str, commit_msg: str):
    log_event(f"🚀 STARTING DEPLOYMENT: commit={commit_sha[:7]} author='{author}' msg='{commit_msg}'")
    
    cmd = (
        f"cd {REPO_DIR} && "
        f"git fetch origin main && "
        f"git reset --hard origin/main && "
        f"docker compose -f docker-compose.gcp.yml build frontend && "
        f"docker compose -f docker-compose.gcp.yml up -d --no-deps frontend"
    )

    try:
        process = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            cwd=REPO_DIR,
        )
        for line in process.stdout:
            log_event(f"   [BUILD] {line.strip()}")
        process.wait()

        if process.returncode == 0:
            log_event(f"✅ DEPLOYMENT SUCCEEDED for commit {commit_sha[:7]}")
        else:
            log_event(f"❌ DEPLOYMENT FAILED with returncode={process.returncode}")
    except Exception as e:
        log_event(f"❌ EXCEPTION during deployment: {str(e)}")


class WebhookHandler(BaseHTTPRequestHandler):
    def send_json(self, status: int, data: dict):
        response = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def do_GET(self):
        # Health check endpoint
        if self.path in ["/", "/health", "/webhooks/deploy"]:
            self.send_json(200, {
                "status": "active",
                "service": "Omniweb GitHub Webhook CI/CD",
                "repo": REPO_DIR,
                "timestamp": datetime.utcnow().isoformat()
            })
        else:
            self.send_json(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/webhooks/deploy" and self.path != "/":
            self.send_json(404, {"error": "Endpoint not found"})
            return

        # 1. Read Payload
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0 or content_length > 5 * 1024 * 1024:
            self.send_json(400, {"error": "Invalid body size"})
            return

        payload_bytes = self.rfile.read(content_length)

        # 2. Verify HMAC Signature (X-Hub-Signature-256)
        sig_header = self.headers.get("X-Hub-Signature-256") or self.headers.get("x-hub-signature-256")
        if not sig_header:
            log_event("⚠️ Webhook rejected: missing X-Hub-Signature-256 header")
            self.send_json(401, {"error": "Missing signature header"})
            return

        expected_sig = "sha256=" + hmac.new(SECRET, payload_bytes, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig_header, expected_sig):
            log_event("⚠️ Webhook rejected: invalid HMAC signature")
            self.send_json(403, {"error": "Invalid signature"})
            return

        # 3. Parse GitHub event
        event_type = self.headers.get("X-GitHub-Event") or self.headers.get("x-github-event")
        if event_type == "ping":
            log_event("👋 GitHub ping received and verified successfully")
            self.send_json(200, {"status": "pong", "message": "Webhook connection verified"})
            return

        if event_type != "push":
            self.send_json(200, {"status": "ignored", "event": event_type})
            return

        try:
            payload = json.loads(payload_bytes.decode("utf-8"))
        except Exception:
            self.send_json(400, {"error": "Invalid JSON"})
            return

        ref = payload.get("ref", "")
        if ref != "refs/heads/main":
            log_event(f"ℹ️ Ignoring push to branch {ref}")
            self.send_json(200, {"status": "ignored", "branch": ref})
            return

        head_commit = payload.get("head_commit") or {}
        commit_sha = head_commit.get("id", "unknown")
        author = head_commit.get("author", {}).get("name", "unknown")
        commit_msg = head_commit.get("message", "").split("\n")[0]

        # 4. Asynchronously spawn deployment thread to immediately return 200 OK to GitHub
        thread = threading.Thread(
            target=execute_deployment,
            args=(commit_sha, author, commit_msg),
            daemon=True,
        )
        thread.start()

        self.send_json(200, {
            "status": "deploying",
            "commit": commit_sha[:7],
            "author": author,
            "message": commit_msg,
            "timestamp": datetime.utcnow().isoformat(),
        })


def main():
    log_event(f"🚀 Starting Omniweb GitHub Webhook Receiver on 0.0.0.0:{PORT}...")
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        log_event("🛑 Webhook receiver stopped.")


if __name__ == "__main__":
    main()
