import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI not found")

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000
)

db = client["recruit_ai"]