import requests
import time
from config import Config

def fetch_internships(role):
    url = "https://api.openwebninja.com/jsearch/search"
    
    # Simple query: Just the role + one city. 
    # We will alternate cities or just search India-wide.
    query = f"{role} internship in India" 
    
    headers = {
        "x-api-key": Config.OPENWEB_TOKEN 
    }
    
    params = {
        "query": query,
        "page": 1,
        "num_pages": 1,
        "date_posted": "month", # Broader time range
        "employment_types": "INTERN",
        "remote_jobs_only": "false" 
    }

    try:
        time.sleep(1)
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json().get('data', [])
            print(f"DEBUG: API returned {len(data)} total jobs for {role}") # <--- ADD THIS
            # Filter for Pune/Bangalore locally instead of in the API 
            # to avoid the "0 results" API bug.
            filtered_data = [
                job for job in data 
                if any(city in (job.get('job_city') or "").lower() 
                for city in ['pune', 'bangalore', 'bengaluru'])
            ]
            return filtered_data if filtered_data else data # Return all if filter is too strict
        else:
            print(f" Error {response.status_code}: {response.text}")
            return []
    except Exception as e:
        print(f" Connection Error: {e}")
        return []