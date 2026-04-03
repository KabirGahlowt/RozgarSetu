import pandas as pd
import requests
import json
import random

BASE_API_URL = "http://localhost:8000/api/v1/worker"
CSV_FILE = "data/test_addresses.csv"
OUTPUT_CSV = "data/workers.csv"

def seed_data():
    print("Loading test dataset...")
    df = pd.read_csv(CSV_FILE)
    
    new_bots_data = []
    
    print("Iterating through workers...")
    for idx, row in df.iterrows():
        # Register via Node.js API
        payload = {
            "fullname": row['fullname'],
            "phoneNumber": int(row['phoneNumber']),
            "password": row['password'],
            "address": row['address'],
            "city": row['city'],
            "pincode": int(row['pincode']),
            "skills": row['skills'],
            "avaliability": row['availability'],
            "experienceYears": int(row['experienceYears'])
        }
        
        try:
            res = requests.post(f"{BASE_API_URL}/register", data=payload, files={'dummy': ('', '')}, timeout=10)
            if res.status_code not in (200, 201):
                if "already exists" not in res.text:
                    print(f"Failed to register {row['fullname']}: {res.text}")
        except Exception as e:
            print(f"Error registering {row['fullname']}: {str(e)}")
            
    # Now fetch all workers to get their real MongoDB IDs
    print("Fetching populated workers from MongoDB API...")
    res = requests.get(f"{BASE_API_URL}/getAllWorkers")
    if res.status_code == 200:
        db_workers = res.json().get('workers', [])
        
        for w in db_workers:
            # Map MongoDB worker to bot CSV format
            rating = round(random.uniform(4.0, 5.0), 1) 
            available = True
            
            # Using absolute path for frontend to load photos if possible, 
            # but since it's just 'data/profile_photos/name.png' we'll feed a generic avatar URL if none exists
            # We will generate generic unplash avatar based on name
            first_name = w.get('fullname', 'User').split(' ')[0]
            photo = w.get('profilePhoto')
            if not photo or 'data/' in photo:
                photo = f"https://api.dicebear.com/7.x/initials/svg?seed={first_name}&backgroundColor=6A38C2"
            
            new_bots_data.append({
                "worker_id": str(w['_id']), # Mongoose ObjectID!
                "name": w['fullname'],
                "skills": w.get('skills', 'General'),
                "location": w.get('city', 'Unknown'),
                "address": w.get('address', ''),
                "pincode": w.get('pincode', ''),
                "experience_years": w.get('experienceYears', 0),
                "rating": rating,
                "phone": w.get('phoneNumber', ''),
                "available": available,
                "profile_photo": photo
            })
            
        out_df = pd.DataFrame(new_bots_data)
        out_df.to_csv(OUTPUT_CSV, index=False)
        print(f"Generated {OUTPUT_CSV} with {len(out_df)} workers mapped to MongoDB IDs!")
    else:
        print("Failed to fetch workers from backend API!")

if __name__ == "__main__":
    seed_data()
