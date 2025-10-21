import firebase_admin
from firebase_admin import auth, credentials

if not firebase_admin._apps:
    firebase_admin.initialize_app()

def verify_token(authorization_header: str):
    if not authorization_header or not authorization_header.startswith("Bearer "):
        raise ValueError("Missing Authorization")
    token = authorization_header.split(" ")[1]
    decoded = auth.verify_id_token(token)
    return decoded["uid"]
