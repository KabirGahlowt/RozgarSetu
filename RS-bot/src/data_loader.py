"""
Data loading and preprocessing utilities for RozgarSetu
"""
import pandas as pd
import sqlite3
from typing import List, Dict, Tuple, Optional, Union
import os

try:
    from src.ids import normalize_entity_id
except ImportError:
    from ids import normalize_entity_id
import io
import random

try:
    import requests as _requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

# Backend API base URL — override via BACKEND_API_URL env var
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000/api/v1")


class DataLoader:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.workers_df = None
        self.jobs_df = None
        self.interactions_df = None
        self.column_mapping = {}  # Store custom column mappings

    # ─── Live API loader ────────────────────────────────────────────────────────
    def load_workers_from_api(self) -> bool:
        """
        Fetch all workers from the Node.js / MongoDB backend API and populate
        self.workers_df.  Returns True on success, False on any failure.

        MongoDB worker fields → bot CSV fields mapping:
          _id            → worker_id
          fullname       → name
          phoneNumber    → phone
          city           → location
          address        → address
          pincode        → pincode
          skills         → skills
          avaliability   → available
          experienceYears→ experience_years
          profilePhoto   → profile_photo
        """
        if not REQUESTS_AVAILABLE:
            print("Warning: 'requests' package not installed — cannot fetch from API.")
            return False

        url = f"{BACKEND_API_URL}/worker/getAllWorkers"
        try:
            print(f"[DataLoader] Fetching workers from backend API: {url}")
            resp = _requests.get(url, timeout=8)
            if resp.status_code != 200:
                print(f"[DataLoader] Backend returned {resp.status_code}. Falling back to CSV.")
                return False

            data = resp.json()
            raw_workers = data.get("workers", [])
            if not raw_workers:
                print("[DataLoader] Backend returned 0 workers. Falling back to CSV.")
                return False

            rows = []
            for w in raw_workers:
                first_name = (w.get("fullname") or "User").split()[0]
                photo = w.get("profilePhoto") or ""
                if not photo or photo.startswith("data/"):
                    photo = (
                        f"https://api.dicebear.com/7.x/initials/svg"
                        f"?seed={first_name}&backgroundColor=6A38C2"
                    )

                rows.append({
                    "worker_id":       str(w.get("_id", "")),
                    "name":            w.get("fullname", "Unknown"),
                    "phone":           str(w.get("phoneNumber", "")),
                    "location":        w.get("city", "Unknown"),
                    "address":         w.get("address", ""),
                    "pincode":         str(w.get("pincode", "")),
                    "skills":          w.get("skills", ""),
                    "available":       w.get("avaliability", "Full-time"),
                    "experience_years": int(w.get("experienceYears") or 0),
                    "rating":          round(random.uniform(4.0, 5.0), 1),
                    "profile_photo":   photo,
                })

            self.workers_df = pd.DataFrame(rows)
            self._normalize_workers_columns()
            print(f"[DataLoader] ✅ Loaded {len(rows)} workers from backend API.")
            return True

        except Exception as exc:
            print(f"[DataLoader] API fetch failed: {exc}. Falling back to CSV.")
            return False

    # ─── Main loader ────────────────────────────────────────────────────────────
    def load_data(self, workers_file: Optional[str] = None,
                  jobs_file: Optional[str] = None,
                  interactions_file: Optional[str] = None):
        """Load all data — workers from live API first, then CSV fallback."""

        # ── Workers ──────────────────────────────────────────────────────────
        if workers_file:
            # Explicit file path overrides everything (used by Streamlit app)
            self.workers_df = pd.read_csv(workers_file)
            self._normalize_workers_columns()
        else:
            # Try live API first
            api_ok = self.load_workers_from_api()
            if not api_ok:
                # Fallback: workers.csv
                workers_path = os.path.join(self.data_dir, "workers.csv")
                if os.path.exists(workers_path):
                    print(f"[DataLoader] Loading workers from {workers_path}")
                    self.workers_df = pd.read_csv(workers_path)
                    self._normalize_workers_columns()
                else:
                    print("[DataLoader] ⚠️  No workers source found (API offline & no workers.csv).")

        # ── Jobs ─────────────────────────────────────────────────────────────
        if jobs_file:
            self.jobs_df = pd.read_csv(jobs_file)
            self._normalize_jobs_columns()
        else:
            jobs_path = os.path.join(self.data_dir, "jobs.csv")
            if os.path.exists(jobs_path):
                self.jobs_df = pd.read_csv(jobs_path)
                self._normalize_jobs_columns()

        # ── Interactions ──────────────────────────────────────────────────────
        if interactions_file:
            self.interactions_df = pd.read_csv(interactions_file)
            self._normalize_interactions_columns()
        else:
            interactions_path = os.path.join(self.data_dir, "interactions.csv")
            if os.path.exists(interactions_path):
                self.interactions_df = pd.read_csv(interactions_path)
                self._normalize_interactions_columns()
            else:
                self.interactions_df = pd.DataFrame(
                    columns=['worker_id', 'job_id', 'rating', 'interaction_type', 'date']
                )

        return self.workers_df, self.jobs_df, self.interactions_df




    def load_from_dataframe(self, workers_df: Optional[pd.DataFrame] = None,
                           jobs_df: Optional[pd.DataFrame] = None,
                           interactions_df: Optional[pd.DataFrame] = None):
        """Load data from pandas DataFrames (for uploaded files)"""
        if workers_df is not None:
            self.workers_df = workers_df.copy()
            self._normalize_workers_columns()
        
        if jobs_df is not None:
            self.jobs_df = jobs_df.copy()
            self._normalize_jobs_columns()
        
        if interactions_df is not None:
            self.interactions_df = interactions_df.copy()
            self._normalize_interactions_columns()
        elif self.interactions_df is None:
            # Create empty interactions if not provided
            self.interactions_df = pd.DataFrame(columns=['worker_id', 'job_id', 'rating', 'interaction_type', 'date'])
        
        return self.workers_df, self.jobs_df, self.interactions_df
    
    def _normalize_workers_columns(self):
        """Normalize worker column names to standard format"""
        if self.workers_df is None or self.workers_df.empty:
            return
        
        # Column name mapping (flexible)
        column_map = {
            'id': 'worker_id',
            'worker_id': 'worker_id',
            'workerid': 'worker_id',
            'name': 'name',
            'worker_name': 'name',
            'full_name': 'name',
            'fullname': 'name',
            'skills': 'skills',
            'skill': 'skills',
            'skill_set': 'skills',
            'location': 'location',
            'loc': 'location',
            'city': 'location',
            'area': 'location',
            'address': 'address',
            'street_address': 'address',
            'street': 'address',
            'pincode': 'pincode',
            'pin': 'pincode',
            'postal_code': 'pincode',
            'zip': 'pincode',
            'experience': 'experience_years',
            'experience_years': 'experience_years',
            'experienceyears': 'experience_years',
            'exp': 'experience_years',
            'years_experience': 'experience_years',
            'rating': 'rating',
            'worker_rating': 'rating',
            'score': 'rating',
            'phone': 'phone',
            'phonenumber': 'phone',
            'phone_number': 'phone',
            'contact': 'phone',
            'mobile': 'phone',
            'available': 'available',
            'is_available': 'available',
            'availability': 'available',
            'status': 'available',
            'profilephoto': 'profile_photo',
            'profile_photo': 'profile_photo',
            'photo': 'profile_photo',
            'image': 'profile_photo'
        }
        
        # Rename columns
        self.workers_df.columns = [col.lower().strip() for col in self.workers_df.columns]
        for old_col, new_col in column_map.items():
            if old_col in self.workers_df.columns and new_col not in self.workers_df.columns:
                self.workers_df.rename(columns={old_col: new_col}, inplace=True)
        
        # Ensure required columns exist with defaults
        required_cols = {
            'worker_id': lambda: range(1, len(self.workers_df) + 1),
            'name': 'Unknown',
            'skills': '',
            'location': 'Unknown',
            'address': '',
            'pincode': '',
            'experience_years': 0,
            'rating': 0.0,
            'phone': '',
            'available': True,
            'profile_photo': 'https://via.placeholder.com/150'
        }
        
        for col, default in required_cols.items():
            if col not in self.workers_df.columns:
                if callable(default):
                    self.workers_df[col] = list(default())
                else:
                    self.workers_df[col] = default
        
        # Normalize the 'available' column to boolean
        def is_available(val):
            if pd.isna(val): return True
            if isinstance(val, bool): return val
            if isinstance(val, (int, float)): return val != 0
            val_str = str(val).lower().strip()
            return val_str in ['true', '1', 'yes', 'available', 'full-time', 'part-time', 'on-demand', 'freelance']
            
        self.workers_df['available'] = self.workers_df['available'].apply(is_available)

        # Create full_address field by combining address, location, and pincode
        if 'address' in self.workers_df.columns and 'location' in self.workers_df.columns:
            self.workers_df['full_address'] = self.workers_df.apply(
                lambda row: f"{row.get('address', '')}, {row.get('location', '')}, {row.get('pincode', '')}, India".strip(', '),
                axis=1
            )
        elif 'location' in self.workers_df.columns:
            self.workers_df['full_address'] = self.workers_df['location'].astype(str) + ", India"
    
    def _normalize_jobs_columns(self):
        """Normalize job column names to standard format"""
        if self.jobs_df is None or self.jobs_df.empty:
            return
        
        column_map = {
            'id': 'job_id',
            'job_id': 'job_id',
            'jobid': 'job_id',
            'title': 'title',
            'job_title': 'title',
            'position': 'title',
            'required_skills': 'required_skills',
            'skills': 'required_skills',
            'skill_required': 'required_skills',
            'location': 'location',
            'loc': 'location',
            'city': 'location',
            'area': 'location',
            'address': 'address',
            'street_address': 'address',
            'street': 'address',
            'pincode': 'pincode',
            'pin': 'pincode',
            'postal_code': 'pincode',
            'zip': 'pincode',
            'required_experience': 'required_experience_years',
            'required_experience_years': 'required_experience_years',
            'experience_required': 'required_experience_years',
            'min_experience': 'required_experience_years',
            'work_type': 'work_type',
            'type': 'work_type',
            'employment_type': 'work_type',
            'wage_min': 'wage_min',
            'min_wage': 'wage_min',
            'salary_min': 'wage_min',
            'wage_max': 'wage_max',
            'max_wage': 'wage_max',
            'salary_max': 'wage_max',
            'status': 'status',
            'job_status': 'status',
            'posted_date': 'posted_date',
            'date': 'posted_date'
        }
        
        self.jobs_df.columns = [col.lower().strip() for col in self.jobs_df.columns]
        for old_col, new_col in column_map.items():
            if old_col in self.jobs_df.columns and new_col not in self.jobs_df.columns:
                self.jobs_df.rename(columns={old_col: new_col}, inplace=True)
        
        required_cols = {
            'job_id': lambda: range(1, len(self.jobs_df) + 1),
            'title': 'Job Opening',
            'required_skills': '',
            'location': 'Unknown',
            'address': '',
            'pincode': '',
            'required_experience_years': 0,
            'work_type': 'Full-time',
            'wage_min': 0,
            'wage_max': 0,
            'status': 'Open',
            'posted_date': pd.Timestamp.now().strftime('%Y-%m-%d')
        }
        
        for col, default in required_cols.items():
            if col not in self.jobs_df.columns:
                if callable(default):
                    self.jobs_df[col] = list(default())
                else:
                    self.jobs_df[col] = default
        
        # Create full_address field for jobs
        if 'address' in self.jobs_df.columns and 'location' in self.jobs_df.columns:
            self.jobs_df['full_address'] = self.jobs_df.apply(
                lambda row: f"{row.get('address', '')}, {row.get('location', '')}, {row.get('pincode', '')}, India".strip(', '),
                axis=1
            )
        elif 'location' in self.jobs_df.columns:
            self.jobs_df['full_address'] = self.jobs_df['location'].astype(str) + ", India"
    
    def _normalize_interactions_columns(self):
        """Normalize interactions column names"""
        if self.interactions_df is None or self.interactions_df.empty:
            return
        
        column_map = {
            'worker_id': 'worker_id',
            'workerid': 'worker_id',
            'job_id': 'job_id',
            'jobid': 'job_id',
            'rating': 'rating',
            'score': 'rating',
            'interaction_type': 'interaction_type',
            'type': 'interaction_type',
            'date': 'date',
            'timestamp': 'date'
        }
        
        self.interactions_df.columns = [col.lower().strip() for col in self.interactions_df.columns]
        for old_col, new_col in column_map.items():
            if old_col in self.interactions_df.columns and new_col not in self.interactions_df.columns:
                self.interactions_df.rename(columns={old_col: new_col}, inplace=True)
    
    def get_worker(self, worker_id) -> Dict:
        """Get worker profile by ID"""
        if self.workers_df is None or self.workers_df.empty:
            raise ValueError("Workers data not loaded")
        
        matches = self.workers_df[self.workers_df['worker_id'] == worker_id]
        if matches.empty:
            matches = self.workers_df[self.workers_df['worker_id'].astype(str) == str(worker_id)]
        if matches.empty and isinstance(worker_id, str) and worker_id.isdigit():
            wid = int(worker_id)
            matches = self.workers_df[self.workers_df['worker_id'] == wid]
        if matches.empty and isinstance(worker_id, (int, float)) and not pd.isna(worker_id):
            matches = self.workers_df[self.workers_df['worker_id'].astype(str) == str(int(worker_id))]
            
        if matches.empty:
            raise ValueError(f"Worker with ID {worker_id} not found")
            
        worker = matches.iloc[0]
        
        # Handle skills (can be string or list)
        skills = worker['skills']
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',') if s.strip()]
        elif pd.isna(skills):
            skills = []
        
        # Handle available field (can be bool, string, or int)
        available = worker.get('available', True)
        if isinstance(available, str):
            # Treat common employment types as "Available"
            available_terms = ['true', '1', 'yes', 'available', 'full-time', 'part-time', 'on-demand', 'freelance']
            available = available.lower() in available_terms
        elif pd.isna(available):
            available = True
        
        return {
            'worker_id': str(worker['worker_id']),
            'name': str(worker['name']),
            'skills': skills,
            'location': str(worker['location']),
            'address': str(worker.get('address', '')) if pd.notna(worker.get('address')) else '',
            'pincode': str(worker.get('pincode', '')) if pd.notna(worker.get('pincode')) else '',
            'full_address': str(worker.get('full_address', worker['location'])),
            'experience_years': int(worker['experience_years']) if pd.notna(worker['experience_years']) else 0,
            'rating': float(worker['rating']) if pd.notna(worker['rating']) else 0.0,
            'phone': str(worker['phone']) if pd.notna(worker['phone']) else '',
            'available': bool(available),
            'profile_photo': str(worker['profile_photo']) if pd.notna(worker.get('profile_photo')) and str(worker['profile_photo']).strip() else 'https://via.placeholder.com/150'
        }
    
    def get_job(self, job_id) -> Dict:
        """Get job details by ID"""
        if self.jobs_df is None or self.jobs_df.empty:
            raise ValueError("Jobs data not loaded")
        
        matches = self.jobs_df[self.jobs_df['job_id'] == job_id]
        if matches.empty:
            matches = self.jobs_df[self.jobs_df['job_id'].astype(str) == str(job_id)]
        if matches.empty and isinstance(job_id, str) and job_id.isdigit():
            matches = self.jobs_df[self.jobs_df['job_id'] == int(job_id)]
        if matches.empty and isinstance(job_id, (int, float)) and not pd.isna(job_id):
            matches = self.jobs_df[self.jobs_df['job_id'].astype(str) == str(int(job_id))]

        if matches.empty:
            raise ValueError(f"Job with ID {job_id} not found")
            
        job = matches.iloc[0]
        
        # Handle required_skills
        required_skills = job['required_skills']
        if isinstance(required_skills, str):
            required_skills = [s.strip() for s in required_skills.split(',') if s.strip()]
        elif pd.isna(required_skills):
            required_skills = []
        
        jid_out: Union[int, str] = normalize_entity_id(job['job_id'])
        
        return {
            'job_id': jid_out,
            'title': str(job['title']),
            'required_skills': required_skills,
            'location': str(job['location']),
            'address': str(job.get('address', '')) if pd.notna(job.get('address')) else '',
            'pincode': str(job.get('pincode', '')) if pd.notna(job.get('pincode')) else '',
            'full_address': str(job.get('full_address', job['location'])),
            'required_experience_years': int(job['required_experience_years']) if pd.notna(job['required_experience_years']) else 0,
            'work_type': str(job['work_type']),
            'wage_min': int(job['wage_min']) if pd.notna(job['wage_min']) else 0,
            'wage_max': int(job['wage_max']) if pd.notna(job['wage_max']) else 0,
            'status': str(job['status']) if pd.notna(job['status']) else 'Open'
        }
    
    def get_all_jobs(self) -> pd.DataFrame:
        """Get all open jobs"""
        return self.jobs_df[self.jobs_df['status'] == 'Open'].copy()
    
    def get_all_workers(self) -> pd.DataFrame:
        """Get all available workers"""
        return self.workers_df[self.workers_df['available'] == True].copy()
    
    def get_interactions(self) -> pd.DataFrame:
        """Get all interactions"""
        return self.interactions_df.copy()
    
    def setup_database(self, db_path: str = "rozgarsetu.db"):
        """Setup SQLite database"""
        conn = sqlite3.connect(db_path)
        self.workers_df.to_sql('workers', conn, if_exists='replace', index=False)
        self.jobs_df.to_sql('jobs', conn, if_exists='replace', index=False)
        self.interactions_df.to_sql('interactions', conn, if_exists='replace', index=False)
        conn.close()
        return db_path
