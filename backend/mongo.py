# mongo.py
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def test_connection():
    try:
        # Load URI from .env
        uri = os.getenv("MONGO_URI")
        client = MongoClient(uri)
        
        # The is_primary command is a cheap way to check the connection
        client.admin.command('hello')
        print(" MongoDB connection successful!")
        
        # Check if the specific DB and collection are accessible
        db = client['internship_pilot']
        print(f"Connected to database: {db.name}")
        
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_connection()