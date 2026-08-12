import os
from dotenv import load_dotenv
import boto3

load_dotenv()

R2_ENDPOINT = os.getenv("R2_ENDPOINT")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET")

missing = []

if not R2_ENDPOINT:
    missing.append("R2_ENDPOINT")

if not R2_ACCESS_KEY_ID:
    missing.append("R2_ACCESS_KEY_ID")

if not R2_SECRET_ACCESS_KEY:
    missing.append("R2_SECRET_ACCESS_KEY")

if not R2_BUCKET:
    missing.append("R2_BUCKET")

if missing:
    raise RuntimeError(
        f"Missing environment variables: {', '.join(missing)}"
    )

r2_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
)