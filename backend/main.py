import time
import json
import certifi
import random
import re
from pymongo import MongoClient
from tqdm import tqdm
from scraper import fetch_internships
from utils import analyze_job_fit
from config import Config

# Setup MongoDB
client = MongoClient(Config.MONGO_URI, tls=True, tlsCAFile=certifi.where())
db = client['GetThatBag']
jobs_col = db['postings']

def extract_json(text):
    """Robustly extract JSON from Gemini's markdown-heavy response."""
    try:
        # Look for content between ```json and ```
        match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            return match.group(1).strip()
        # Fallback: find first { and last }
        match = re.search(r'(\{.*\})', text, re.DOTALL)
        if match:
            return match.group(1).strip()
        return text.strip()
    except Exception:
        return text

def process_job_with_retry(job, resume_content, max_retries=5):
    job_id = job.get('job_id')
    company = job.get('employer_name', 'Unknown')
    
    if jobs_col.find_one({"job_id": job_id}):
        return "exists"

    for attempt in range(max_retries):
        try:
            raw_analysis = analyze_job_fit(job.get('job_title'), job.get('job_description'), resume_content)
            
            # Clean and Parse JSON
            clean_json = extract_json(raw_analysis)
            analysis_data = json.loads(clean_json)
            
            # Enrich Data
            job['ai_analysis'] = analysis_data
            job['is_summer_role'] = analysis_data.get('is_summer_role', False)
            job['is_startup'] = analysis_data.get('is_startup', False)
            job['is_tracked'] = False
            job['scraped_at'] = time.time()
            job['is_diversity'] = any(word in job.get('job_title', '').upper() for word in ['WOW', 'STEP', 'CODESS', 'DIVERSITY'])

            jobs_col.insert_one(job)
            return "success"

        except (json.JSONDecodeError, Exception) as e:
            error_msg = str(e)
            
            # Catch Rate Limits
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                # Exponential backoff: 30s, 60s, 120s... + jitter
                wait_time = (2 ** attempt) * 30 + random.uniform(5, 15)
                print(f"\n⏳ Rate Limit (429) for {company}. Attempt {attempt+1}/{max_retries}. Waiting {int(wait_time)}s...")
                for _ in tqdm(range(int(wait_time)), desc="Cooldown"):
                    time.sleep(1)
                continue
            
            print(f"\nAnalysis Error for {company}: {error_msg}")
            return "error"
                
    return "failed"

def run_pipeline():
    try:
        with open("resume.tex", "r") as f:
            resume_content = f.read()
    except FileNotFoundError:
        resume_content = "Third year student at WCE Sangli, targeting SDE Intern roles."

    target_roles = [
        "SDE Intern 2026", 
        "Software Engineer Intern", 
        "Backend Developer Intern",
        "Startup SDE Intern",
        "Startup Software Engineer Intern",
        "FinTech Developer Intern",
        "DeepTech SDE Intern",
        "AI ML Engineer Intern"
    ]
    
    for role in target_roles:
        print(f"\n Hunting for {role}...")
        raw_jobs = fetch_internships(role)
        
        if not raw_jobs: continue

        for job in tqdm(raw_jobs, desc=f"Processing {role}"):
            result = process_job_with_retry(job, resume_content)
            
            if result == "success":
                # 12s delay ensures we stay well under the 5-15 RPM limit safely
                time.sleep(12 + random.uniform(0, 3)) 
            elif result == "exists":
                continue 

if __name__ == "__main__":
    # Avoid printing non-ASCII emoji on Windows consoles (cp1252)
    print("Starting Production-Grade Scraper...")
    run_pipeline()