#!/usr/bin/env python3
"""Hardened local HTTP server for 'If All Artifacts Returned Home'.

Security posture:
- Strictly allowlists GET and HEAD methods (returns 405 on all other verbs).
- Enforces strict directory-boundary containment under ./public/ (prevents path traversal).
- Emits strict Content-Security-Policy (no unsafe-inline, no unsafe-eval),
  X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN,
  Permissions-Policy, Referrer-Policy, and Cross-Origin-Opener-Policy headers.
- Enforces per-IP sliding-window rate limiting on all requests.
- Rejects wildcard bind addresses (0.0.0.0 / ::) by design.

TODO(security): This exhibition serves public, read-only open museum metadata with no
user accounts, cookies, file uploads, or database writes. If authenticated or
state-changing endpoints are introduced in the future, integrate OAuth 2.0 / OIDC
authentication, __Host- HttpOnly+Secure+SameSite cookies, synchronizer CSRF tokens,
and KMS-managed secrets.
"""

from __future__ import annotations

import argparse
import collections
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
import os
import pathlib
import socket
import threading
import time
import urllib.parse

BASE_DIR = pathlib.Path(__file__).resolve().parent
PUBLIC_DIR = (BASE_DIR / "public").resolve()

ALLOWED_MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
}

ARCHIVE_SUMMARY = {
    "titleZh": "文物档案库",
    "titleEn": "Artifacts Archive",
    "totalArtifacts": 45008,
    "totalMuseums": 10,
    "totalHomelands": 101,
    "curatedMasterpieces": 325,
    "internationalProvenance": 39608,
    "domesticHostHoldings": 5400,
    "creationSpan": "6000 BC - AD 2023",
    "acquisitionSpan": "1506-2023",
    "pages": ["/index.html", "/stories.html", "/creation-age.html", "/catalog.html"],
    "topOrigins": [
        {"countryEn": "China", "countryZh": "中国", "count": 3675},
        {"countryEn": "Italy", "countryZh": "意大利", "count": 2746},
        {"countryEn": "Egypt", "countryZh": "埃及", "count": 2588},
        {"countryEn": "France", "countryZh": "法国", "count": 2168},
        {"countryEn": "Greece", "countryZh": "希腊", "count": 1976},
        {"countryEn": "Japan", "countryZh": "日本", "count": 1941},
        {"countryEn": "Iran", "countryZh": "伊朗", "count": 1883},
        {"countryEn": "Iraq", "countryZh": "伊拉克", "count": 1669},
        {"countryEn": "Turkey", "countryZh": "土耳其", "count": 1547},
        {"countryEn": "Germany", "countryZh": "德国", "count": 1447},
    ],
}

CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: blob: https://thumb.wikimedia.org https://upload.wikimedia.org https://images.metmuseum.org https://collections.louvre.fr https://www.hermitagemuseum.org; "
    "connect-src 'self'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "frame-ancestors 'self'; "
    "form-action 'none'"
)


class SlidingWindowRateLimiter:
    """Thread-safe per-IP sliding-window rate limiter."""

    def __init__(self, max_requests: int = 240, window_seconds: float = 60.0) -> None:
        self._max = max_requests
        self._window = window_seconds
        self._hits: dict[str, collections.deque[float]] = collections.defaultdict(collections.deque)
        self._lock = threading.Lock()

    def allow(self, client_ip: str) -> bool:
        now = time.monotonic()
        cutoff = now - self._window
        with self._lock:
            q = self._hits[client_ip]
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= self._max:
                return False
            q.append(now)
            return True


RATE_LIMITER = SlidingWindowRateLimiter()


def validate_bind_host(host: str) -> str:
    cleaned = host.strip()
    if cleaned in ("0.0.0.0", "::", "*", ""):
        raise ValueError(f"Refusing wildcard bind address: {cleaned!r}")
    return cleaned


class HardenedExhibitionHandler(BaseHTTPRequestHandler):
    server_version = "ArchivalWeb/1.0"
    sys_version = ""
    allowed_origins: set[str] = set()

    def log_message(self, fmt: str, *args: object) -> None:
        # Log minimal request diagnostics without headers, cookies, or query tokens.
        msg = fmt % args
        print(f"[{self.log_date_time_string()}] {msg}", flush=True)

    def _send_security_headers(self, cache_control: str) -> None:
        self.send_header("Content-Security-Policy", CSP_POLICY)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cache-Control", cache_control)

        origin = self.headers.get("Origin")
        if origin and origin in self.allowed_origins:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def _send_json(self, status: HTTPStatus, payload: dict[str, object], head_only: bool) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_security_headers("no-store")
        self.end_headers()
        if not head_only:
            self.wfile.write(body)

    def _send_plain_error(self, status: HTTPStatus, message: str, head_only: bool = False) -> None:
        body = message.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if status == HTTPStatus.METHOD_NOT_ALLOWED:
            self.send_header("Allow", "GET, HEAD")
        self._send_security_headers("no-store")
        self.end_headers()
        if not head_only:
            self.wfile.write(body)

    def _handle_read_request(self, head_only: bool) -> None:
        client_ip = self.client_address[0] if self.client_address else "unknown"
        if not RATE_LIMITER.allow(client_ip):
            self._send_plain_error(HTTPStatus.TOO_MANY_REQUESTS, "Too many requests.", head_only)
            return

        parsed = urllib.parse.urlsplit(self.path)
        raw_path = urllib.parse.unquote(parsed.path or "/")
        if "\x00" in raw_path or "\\" in raw_path:
            self._send_plain_error(HTTPStatus.BAD_REQUEST, "Invalid path.", head_only)
            return

        if raw_path == "/healthz":
            self._send_json(HTTPStatus.OK, {"status": "ok"}, head_only)
            return

        if raw_path == "/api/summary":
            self._send_json(HTTPStatus.OK, ARCHIVE_SUMMARY, head_only)
            return

        rel_name = "index.html" if raw_path in ("/", "/index.html") else raw_path.lstrip("/")
        candidate = (PUBLIC_DIR / rel_name).resolve()

        # Strict directory boundary verification with trailing path separator
        public_prefix = str(PUBLIC_DIR) + os.sep
        if not str(candidate).startswith(public_prefix) or not candidate.is_file():
            self._send_plain_error(HTTPStatus.NOT_FOUND, "Resource not found.", head_only)
            return

        ext = candidate.suffix.lower()
        content_type = ALLOWED_MIME_TYPES.get(ext)
        if not content_type:
            guessed, _ = mimetypes.guess_type(str(candidate))
            if not guessed:
                self._send_plain_error(HTTPStatus.FORBIDDEN, "Unsupported file type.", head_only)
                return
            content_type = guessed

        data = candidate.read_bytes()
        if ext == ".html":
            cache_hdr = "no-store"
        elif ext == ".webp" and "/img/atlases/" in raw_path:
            cache_hdr = "public, max-age=31536000, immutable"
        elif ext in (".css", ".js") and "v=" in (parsed.query or ""):
            cache_hdr = "public, max-age=31536000, immutable"
        else:
            cache_hdr = "public, max-age=300"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self._send_security_headers(cache_hdr)
        self.end_headers()
        if not head_only:
            self.wfile.write(data)

    def do_GET(self) -> None:  # noqa: N802
        self._handle_read_request(head_only=False)

    def do_HEAD(self) -> None:  # noqa: N802
        self._handle_read_request(head_only=True)

    def do_POST(self) -> None:  # noqa: N802
        self._send_plain_error(HTTPStatus.METHOD_NOT_ALLOWED, "Method not allowed.")

    def do_PUT(self) -> None:  # noqa: N802
        self._send_plain_error(HTTPStatus.METHOD_NOT_ALLOWED, "Method not allowed.")

    def do_DELETE(self) -> None:  # noqa: N802
        self._send_plain_error(HTTPStatus.METHOD_NOT_ALLOWED, "Method not allowed.")

    def do_PATCH(self) -> None:  # noqa: N802
        self._send_plain_error(HTTPStatus.METHOD_NOT_ALLOWED, "Method not allowed.")

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send_plain_error(HTTPStatus.METHOD_NOT_ALLOWED, "Method not allowed.")

    def do_TRACE(self) -> None:  # noqa: N802
        self._send_plain_error(HTTPStatus.METHOD_NOT_ALLOWED, "Method not allowed.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve Artifacts Archive website.")
    parser.add_argument("--host", default="127.0.0.1", help="Primary loopback bind address (default: 127.0.0.1).")
    parser.add_argument("--cloudtop-host", default="", help="Optional secondary interface hostname to bind in addition to loopback.")
    parser.add_argument("--port", type=int, default=8765, help="TCP port to listen on (default: 8765).")
    args = parser.parse_args()

    primary_host = validate_bind_host(args.host)
    port = args.port
    if not (1024 <= port <= 65535):
        raise ValueError("Port must be between 1024 and 65535.")

    fqdn = socket.getfqdn()
    HardenedExhibitionHandler.allowed_origins = {
        f"http://127.0.0.1:{port}",
        f"http://localhost:{port}",
        f"http://{fqdn}:{port}",
    }

    servers: list[ThreadingHTTPServer] = []
    primary_srv = ThreadingHTTPServer((primary_host, port), HardenedExhibitionHandler)
    servers.append(primary_srv)
    print(f"Listening on http://{primary_host}:{port}", flush=True)

    if args.cloudtop_host:
        ct_host = validate_bind_host(args.cloudtop_host)
        ct_ip = socket.gethostbyname(ct_host)
        if ct_ip != primary_host and ct_ip not in ("0.0.0.0", "127.0.0.1"):
            ct_srv = ThreadingHTTPServer((ct_ip, port), HardenedExhibitionHandler)
            servers.append(ct_srv)
            HardenedExhibitionHandler.allowed_origins.add(f"http://{ct_host}:{port}")
            t = threading.Thread(target=ct_srv.serve_forever, daemon=True)
            t.start()
            print(f"Secondary listener active on http://{ct_host}:{port} ({ct_ip}:{port})", flush=True)

    try:
        primary_srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        for s in servers:
            s.server_close()


if __name__ == "__main__":
    main()
