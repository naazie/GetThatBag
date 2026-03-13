from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import certifi
import os
import sys
import subprocess
import threading
from bson import ObjectId
from config import Config

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient(Config.MONGO_URI, tls=True, tlsCAFile=certifi.where())
db = client['GetThatBag']
jobs_col = db['postings']

# --- PATH CONFIGURATION ---
# This dynamically finds main.py regardless of where you launch app.py from
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPT_PATH = os.path.join(BASE_DIR, 'main.py')

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = list(jobs_col.find().sort([
            ("ai_analysis.score", -1), 
            ("scraped_at", -1)
        ]))
        for job in jobs:
            job['_id'] = str(job['_id'])
        return jsonify(jobs), 200
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/api/run-scraper', methods=['POST'])
def run_scraper_route():
    """
    Triggers the scraper in a background thread so the UI doesn't freeze.
    """
    def task():
        try:
            print(f"---  STARTING SCRAPER ---")
            print(f"Exec: {sys.executable}")
            print(f"Path: {SCRIPT_PATH}")
            
            # Using absolute paths and current working directory
            # capture_output=True allows us to see logs in the Flask terminal
            result = subprocess.run(
                [sys.executable, SCRIPT_PATH],
                cwd=BASE_DIR,
                capture_output=True,
                text=True
            )

            if result.returncode != 0:
                print(" SCRAPER CRASHED:")
                print(result.stderr)
            else:
                print("SCRAPER FINISHED SUCCESSFULLY:")
                print(result.stdout)
                
        except Exception as e:
            print(f" Subprocess Execution Error: {str(e)}")

    # Start the scraper in the background
    thread = threading.Thread(target=task)
    thread.start()

    return jsonify({"status": "started", "message": "Scraper is running in background"}), 200

@app.route('/api/jobs/track', methods=['POST'])
def track_job():
    try:
        data = request.json
        job_id = data.get('job_id')
        is_tracked = data.get('is_tracked')
        
        jobs_col.update_one(
            {'_id': ObjectId(job_id)}, 
            {'$set': {'is_tracked': is_tracked}}
        )
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    count = jobs_col.count_documents({})
    return jsonify({"total_jobs": count}), 200



@app.route('/api/jobs/delete', methods=['DELETE'])
def delete_job():
    try:
        job_id = request.args.get('job_id') # Get ID from query params
        if not job_id:
            return jsonify({"error": "No job_id provided"}), 400
            
        result = jobs_col.delete_one({'_id': ObjectId(job_id)})
        
        if result.deleted_count > 0:
            return jsonify({"status": "success", "message": "Job deleted"}), 200
        else:
            return jsonify({"error": "Job not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print(f"📡 GetThatBag API Server starting on http://localhost:5000")
    # Using 0.0.0.0 is best for Fedora/Linux
    app.run(debug=True, host="0.0.0.0", port=5000)