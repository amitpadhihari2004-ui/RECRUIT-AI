import os
from dotenv import load_dotenv

load_dotenv()

# JWT Secret Key
SECRET_KEY = os.getenv("SECRET_KEY")

# JWT Algorithm
ALGORITHM = "HS256"

# Access Token Expiry (Minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Refresh Token Expiry (Days)
REFRESH_TOKEN_EXPIRE_DAYS = 7