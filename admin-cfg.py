#!/usr/bin/env python3
"""
admin_bootstrap.py
------------------
Create Firebase Auth users, assign custom claims (roles), and initialize Firestore profile + audit log.
- Written for Python 3.10+
- Uses Firebase Admin SDK with a Service Account JSON.
- Interactive by default; supports CLI flags for automation.
"""
from __future__ import annotations
import argparse
import os
import sys
import re
import datetime as dt
from dataclasses import dataclass
from typing import Optional

# Crypto-safe password generation
import secrets
import string

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, auth, firestore

# ----------------------------- Configuration ---------------------------------
# You can also pass these via CLI flags. These constants serve as defaults.
DEFAULT_EMAIL_DOMAIN = os.environ.get("FIREBASE_DEFAULT_EMAIL_DOMAIN", "pcacs.com")
DEFAULT_ROLE = os.environ.get("FIREBASE_DEFAULT_ROLE", "admin")  # one of: admin|staff|user
ENV_SERVICE_ACCOUNT = "FIREBASE_SERVICE_ACCOUNT"  # optional env var pointing to service-account.json

# Firestore collections/fields used by the app (keep in sync with your Web client)
COLL_PROFILES = "profiles"
COLL_AUTH_LOGS = "auth_logs"  # structure: auth_logs/{uid}/events/{logId}

@dataclass
class NewAccount:
    email: str
    username: str
    role: str
    temp_password: str

# --------------------------- Utility Functions -------------------------------
def is_valid_email(email: str) -> bool:
    """Simple email format checker. Firebase will also validate server-side."""
    if not email or "@" not in email:
        return False
    # very lightweight pattern; don't over-constrain to avoid false negatives
    return re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) is not None

def generate_temp_password(length: int = 14) -> str:
    """
    Generate a temp password that meets common composition requirements:
    - at least one lowercase, uppercase, digit, and symbol
    - crypto-strong using secrets
    """
    if length < 10:
        length = 10
    alphabet_lo = string.ascii_lowercase
    alphabet_up = string.ascii_uppercase
    digits = string.digits
    symbols = "!@#$%^&*()-_=+[]{}:,.?"
    # ensure required classes
    core = [
        secrets.choice(alphabet_lo),
        secrets.choice(alphabet_up),
        secrets.choice(digits),
        secrets.choice(symbols),
    ]
    pool = alphabet_lo + alphabet_up + digits + symbols
    core += [secrets.choice(pool) for _ in range(length - len(core))]
    # shuffle
    for i in range(len(core)-1, 0, -1):
        j = secrets.randbelow(i+1)
        core[i], core[j] = core[j], core[i]
    return "".join(core)

def pick_role(raw: Optional[str]) -> str:
    allowed = {"admin", "staff", "user"}
    if raw and raw.lower() in allowed:
        return raw.lower()
    return DEFAULT_ROLE if DEFAULT_ROLE in allowed else "user"

def infer_email(username: str, domain: str) -> str:
    return f"{username}@{domain}".lower()

def load_service_account(path_arg: Optional[str]) -> str:
    # Try in order: path_arg -> ENV_SERVICE_ACCOUNT -> ./service-account.json
    if path_arg and os.path.isfile(path_arg):
        return path_arg
    env_path = os.environ.get(ENV_SERVICE_ACCOUNT, "")
    if env_path and os.path.isfile(env_path):
        return env_path
    local_default = os.path.abspath("service-account.json")
    if os.path.isfile(local_default):
        return local_default
    raise FileNotFoundError(
        "Service account JSON not found. Provide --service-account or set "
        f"${ENV_SERVICE_ACCOUNT} or place service-account.json next to this script."
    )

# ----------------------------- Core Logic ------------------------------------
def ensure_firebase_app(service_account_path: str, project_id: Optional[str]) -> None:
    cred = credentials.Certificate(service_account_path)
    opts = {"projectId": project_id} if project_id else None
    firebase_admin.initialize_app(cred, opts)

def create_user_and_profile(acc: NewAccount) -> str:
    """
    Create Firebase Auth user, assign role via custom claims,
    create Firestore profile doc, and append an auth_log event.
    Returns the UID.
    """
    # 1) Create Auth user (Firebase will store a secure password hash internally)
    user = auth.create_user(
        email=acc.email,
        password=acc.temp_password,
        display_name=acc.username,
        email_verified=False,
        disabled=False,
    )
    uid = user.uid

    # 2) Set custom claims (authorization role)
    auth.set_custom_user_claims(uid, {"role": acc.role})

    # 3) Initialize Firestore
    db = firestore.client()

    # 4) Create profile document
    profile_doc = {
        "username": acc.username,
        "email": acc.email,
        "role": acc.role,
        "status": "active",
        "createdAt": dt.datetime.utcnow().isoformat() + "Z",
        "mustChangePassword": True,  # force the first-time password reset flow on UI
        "tempPasswordSetAt": firestore.SERVER_TIMESTAMP,
    }
    db.collection(COLL_PROFILES).document(uid).set(profile_doc)

    # 5) Write an audit log event
    db.collection(COLL_AUTH_LOGS).document(uid).collection("events").add({
        "action": "account_created",
        "by": "admin_script",
        "at": firestore.SERVER_TIMESTAMP,
        "meta": {"role": acc.role}
    })

    return uid

def confirm_summary(uid: str, acc: NewAccount) -> None:
    print("\n=== Account Created ===")
    print(f"UID         : {uid}")
    print(f"Email       : {acc.email}")
    print(f"Username    : {acc.username}")
    print(f"Role        : {acc.role}")
    print("Temp Password: (copy and share securely)")
    print(acc.temp_password)
    print("\nSecurity tip: ask the user to sign in and change password immediately.\n")

# --------------------------- CLI / Interactive -------------------------------
def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Create Firebase user + profile + role (custom claims)")
    p.add_argument("--service-account", help="Path to service account JSON. Fallback: $%s or ./service-account.json" % ENV_SERVICE_ACCOUNT)
    p.add_argument("--project-id", help="Optional Firebase projectId override.")
    p.add_argument("--username", help="Username (letters/digits/._-). If omitted, prompt interactively.")
    p.add_argument("--email", help="Email (if omitted, will infer from username@domain).")
    p.add_argument("--domain", default=DEFAULT_EMAIL_DOMAIN, help=f"Domain for inferred email. Default: {DEFAULT_EMAIL_DOMAIN}")
    p.add_argument("--role", choices=["admin","staff","user"], default=DEFAULT_ROLE, help=f"Role to assign (custom claim). Default: {DEFAULT_ROLE}")
    p.add_argument("--password-length", type=int, default=14, help="Length of the auto-generated temp password (>=10).")
    return p

def interactive_prompt(args: argparse.Namespace) -> NewAccount:
    # 1) Username
    username = args.username
    while not username:
        username = input("Enter username: ").strip()
        if not username:
            print("Username is required.")
    # light validation for username (allow letters/digits/._-)
    if not re.match(r"^[A-Za-z0-9._-]{3,64}$", username):
        print("Warning: unusual username format. Allowed: letters/digits/._- (3-64 chars).")

    # 2) Email (optional; infer if absent)
    email = args.email or ""
    if email:
        if not is_valid_email(email):
            print("Provided email is invalid format.")
            sys.exit(2)
    else:
        domain = args.domain or DEFAULT_EMAIL_DOMAIN
        email = infer_email(username, domain)
        print(f"Inferred email: {email}")

    # 3) Role
    role = pick_role(args.role)

    # 4) Temp password (always auto-generated for safety)
    temp_password = generate_temp_password(args.password_length)

    return NewAccount(email=email, username=username, role=role, temp_password=temp_password)

def main():
    parser = build_arg_parser()
    args = parser.parse_args()

    try:
        service_account_path = load_service_account(args.service_account)
    except FileNotFoundError as e:
        print(str(e))
        sys.exit(1)

    try:
        ensure_firebase_app(service_account_path, args.project_id)
    except Exception as e:
        print("Failed to initialize Firebase Admin SDK:", e)
        sys.exit(1)

    acc = interactive_prompt(args)

    # Sanity check for email format
    if not is_valid_email(acc.email):
        print("Email is invalid. Aborting.")
        sys.exit(2)

    try:
        uid = create_user_and_profile(acc)
        confirm_summary(uid, acc)
        sys.exit(0)
    except Exception as e:
        print("Error during account creation:", e)
        sys.exit(3)

if __name__ == "__main__":
    main()
