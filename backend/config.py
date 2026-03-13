# config.py
import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

class Config:
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    OPENWEB_TOKEN = os.getenv("OPENWEB_TOKEN")
    MONGO_URI = os.getenv("MONGO_URI")
    @classmethod
    def validate(cls):
        if not cls.GEMINI_KEY:
            raise ValueError(" Missing GEMINI_API_KEY! Check your .env file.")
        print(" Keys loaded successfully.")

# Run validation
if __name__ == "__main__":
    Config.validate()