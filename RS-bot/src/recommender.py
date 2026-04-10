"""
Main Recommendation Engine combining CBF, CF, and CHK-SVM
"""
import os
import sys
from typing import Dict, List, Optional, Tuple, Union

# Handle both package and direct imports
try:
    from .cbf_filter import ContentBasedFilter
    from .cf_filter import CollaborativeFilter
    from .chk_svm import CHKSVMClassifier
    from .data_loader import DataLoader
    from .ids import normalize_entity_id
except ImportError:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from src.cbf_filter import ContentBasedFilter
    from src.cf_filter import CollaborativeFilter
    from src.chk_svm import CHKSVMClassifier
    from src.data_loader import DataLoader
    from src.ids import normalize_entity_id

# Synthetic job used for address-only reverse search (not from DB)
VIRTUAL_JOB_ID = 9999


def _query_skill_overlap(query: Optional[Dict], worker_skills: List) -> float:
    """How well worker skills match parsed query skills [0,1]. Neutral 0.5 if no query skills."""
    if not query:
        return 0.5
    req = query.get("skills") or []
    if not req:
        return 0.5
    ws = [str(s).lower() for s in (worker_skills or [])]
    qs = [str(s).lower() for s in req]
    if not ws:
        return 0.0
    hits = 0
    for q in qs:
        for w in ws:
            if q == w:
                hits += 1
                break
            if len(q) >= 3 and len(w) >= 3 and (q in w or w in q):
                hits += 1
                break
    return hits / max(len(qs), 1)


class RozgarSetuRecommender:
    def __init__(self, data_dir: str = "data", model_path: str = "models/chk_svm_model.joblib", 
                 use_distance_based_location: bool = True, provider: str = "nominatim", api_key: str = None):
        """
        Initialize RozgarSetu Recommender
        
        Args:
            data_dir: Directory containing data files
            model_path: Path to trained CHK-SVM model
            use_distance_based_location: If True, use distance-based location matching
            provider: Geocoding provider ('nominatim' for free, 'google' for Google Maps)
            api_key: API key for paid providers (Google)
        """
        self.data_loader = DataLoader(data_dir)
        self.data_loader.load_data()
        
        self.cbf = ContentBasedFilter(use_distance_based_location, provider, api_key)
        self.cf = CollaborativeFilter(self.data_loader.get_interactions())
        self.svm = CHKSVMClassifier(model_path)
        
        # Cache for jobs
        self.jobs_cache = None
        self._load_jobs_cache()
    
    def _load_jobs_cache(self):
        """Load and cache all open jobs"""
        jobs_df = self.data_loader.get_all_jobs()
        self.jobs_cache = []
        for _, row in jobs_df.iterrows():
            self.jobs_cache.append(
                self.data_loader.get_job(normalize_entity_id(row["job_id"]))
            )
    
    def get_top_matches(self, worker_id: Union[int, str], query: Dict = None, top_k: int = 5) -> List[Dict]:
        """
        Get top-k job matches for a worker
        
        Args:
            worker_id: Worker ID
            query: Optional query filters (location, skills, wage_max, work_type)
            top_k: Number of top matches to return
        
        Returns:
            List of job matches with scores and explanations
        """
        # Get worker profile
        worker = self.data_loader.get_worker(worker_id)
        
        # Filter jobs based on query
        candidate_jobs = self._filter_jobs(query)
        
        if not candidate_jobs:
            return []
        
        # Compute scores for each candidate job
        matches = []
        for job in candidate_jobs:
            # Stage 1: CBF
            cbf_score = self.cbf.compute_similarity(worker, job)
            
            # Stage 2: CF
            cf_score = self.cf.compute_cf_score(worker_id, job['job_id'], k=10)
            
            # Stage 3: CHK-SVM
            final_score = self.svm.predict_proba(cbf_score, cf_score, worker, job)
            
            # Generate explanation
            explanation = self._generate_explanation(worker, job, cbf_score, cf_score, final_score)
            
            matches.append({
                'job_id': job['job_id'],
                'title': job['title'],
                'location': job['location'],
                'address': job.get('address', ''),
                'distance': self.cbf.get_distance_info(worker, job)[1],
                'wage_range': f"{job['wage_min']}-{job['wage_max']}",
                'work_type': job['work_type'],
                'score': final_score,
                'cbf_score': cbf_score,
                'cf_score': cf_score,
                'explanation': explanation,
                'worker': {
                    'worker_id': worker['worker_id'],
                    'name': worker['name'],
                    'phone': worker['phone'],
                    'skills': worker['skills'],
                    'location': worker['location'],
                    'address': worker.get('address', ''),
                    'experience_years': worker['experience_years'],
                    'rating': worker['rating']
                }
            })
        
        # Sort by final score and return top-k
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:top_k]
    
    def get_workers_for_job(self, query: Dict = None, top_k: int = 5) -> Dict:
        """
        Get top-k workers matching a job query (reverse search)
        
        Args:
            query: Job query filters (location, address, skills, wage_max, work_type, required_experience)
            top_k: Number of top matches to return
        
        Returns:
            Dict with 'matches' (List) and 'target_coords' (Tuple or None)
        """
        target_coords = None
        if query:
            # Get coordinates for the search center (Address or Location)
            addr = query.get('address', '')
            loc = query.get('location') or ''
            if addr:
                # Pass address and location (area) correctly so Nominatim gets
                # e.g. "Priyadarshani School Bhosri", "Bhosri" — NOT "Priyadarshani School Bhosri", "Pune"
                target_coords = self.cbf.geocoder.geocode_address(addr, loc)
                # If that fails, try with just the full string (catches landmarks like "Priyadarshani School Bhosri")
                if target_coords is None:
                    target_coords = self.cbf.geocoder.geocode_address(f"{addr} {loc}".strip())
            elif loc:
                target_coords = self.cbf.geocoder.geocode_address(loc)

        # If a specific address is provided, create a virtual job to match against
        if query and query.get('address'):
            address = query['address']
            location = query.get('location', '')
            skills = query.get('skills', [])
            
            # Build the most accurate full_address string for geocoding
            # Include the area/locality in the address so geocoding is correct
            if location and location.lower() not in address.lower():
                full_addr_str = f"{address}, {location}, India"
            else:
                full_addr_str = f"{address}, India"
            
            # Create a virtual job at the specific specified landmark
            candidate_jobs = [{
                'job_id': VIRTUAL_JOB_ID,
                'title': f"Job near {address}",
                'required_skills': skills,
                'location': location or address,
                'address': address,
                'full_address': full_addr_str,
                'required_experience_years': 0,
                'wage_min': 0,
                'wage_max': 999999,
                'work_type': query.get('work_type', 'Full-time'),
                'status': 'Open'
            }]
        else:
            # Filter existing jobs based on query
            candidate_jobs = self._filter_jobs(query)
        
        if not candidate_jobs:
            return {"matches": [], "target_coords": target_coords, "empty_reason": None}
        
        # Get all available workers
        workers_df = self.data_loader.get_all_workers()
        
        # For each job, find matching workers
        all_matches = []
        for job in candidate_jobs:
            for _, worker_row in workers_df.iterrows():
                worker = self.data_loader.get_worker(worker_row["worker_id"])
                
                # Stage 1: CBF (Calculates distance-based score)
                cbf_score = self.cbf.compute_similarity(worker, job)
                
                # Get distance info
                dist_km, dist_str = self.cbf.get_distance_info(worker, job)
                
                # Stage 2: CF (use worker_id, job_id)
                cf_score = self.cf.compute_cf_score(worker['worker_id'], job['job_id'], k=10)
                
                # Stage 3: CHK-SVM
                final_score = self.svm.predict_proba(cbf_score, cf_score, worker, job)
                
                # Generate explanation
                explanation = self._generate_explanation(worker, job, cbf_score, cf_score, final_score)

                w_coords = self.cbf._get_coordinates(worker)
                map_lat = float(w_coords[0]) if w_coords else None
                map_lng = float(w_coords[1]) if w_coords else None
                
                all_matches.append({
                    'worker_id': worker['worker_id'],
                    'name': worker['name'],
                    'phone': worker['phone'],
                    'location': worker['location'],
                    'address': worker.get('address', ''),
                    'distance': dist_str,
                    'distance_km': dist_km,
                    'skills': worker['skills'],
                    'experience_years': worker['experience_years'],
                    'rating': worker['rating'],
                    'job_title': job['title'],
                    'job_location': job['location'],
                    'job_address': job.get('address', ''),
                    'wage_range': f"{job['wage_min']}-{job['wage_max']}" if job.get('job_id') != VIRTUAL_JOB_ID else "Negotiable",
                    'work_type': job['work_type'],
                    'profile_photo': worker.get('profile_photo', ''),
                    'score': final_score,
                    'cbf_score': cbf_score,
                    'cf_score': cf_score,
                    'explanation': explanation,
                    'lat': map_lat,
                    'lng': map_lng,
                })

        # If the query names specific skills, drop workers who do not match any of them.
        if query and query.get("skills"):
            all_matches = [
                m
                for m in all_matches
                if _query_skill_overlap(query, m.get("skills") or []) > 0
            ]
            if not all_matches:
                return {
                    "matches": [],
                    "target_coords": target_coords,
                    "empty_reason": "no_skill_match",
                }

        # Optional minimum star rating from natural language (e.g. "rating more than 3").
        if query and query.get("min_rating") is not None:
            try:
                min_r = float(query["min_rating"])
            except (TypeError, ValueError):
                min_r = None
            strict = bool(query.get("min_rating_strict"))
            if min_r is not None:

                def _rating_ok(m: Dict) -> bool:
                    r = float(m.get("rating") or 0)
                    return r > min_r if strict else r >= min_r

                all_matches = [m for m in all_matches if _rating_ok(m)]
                if not all_matches:
                    return {
                        "matches": [],
                        "target_coords": target_coords,
                        "empty_reason": "no_rating_match",
                    }

        # Rank: primary = skill match, then (if search pin exists) geocoded + closer workers,
        # then blended score (CBF-heavy) so skills > distance > rating.
        def _rank_key(m: Dict) -> Tuple:
            has_pin = target_coords is not None
            dk = m.get("distance_km")
            has_dist = dk is not None
            overlap = _query_skill_overlap(query, m.get("skills") or [])
            # 0 = strong skill match, 1 = partial, 2 = weak / none
            if overlap >= 0.7:
                skill_tier = 0
            elif overlap >= 0.3:
                skill_tier = 1
            else:
                skill_tier = 2
            geo_tier = 1 if (has_pin and not has_dist) else 0
            dist_key = dk if has_dist else float("inf")
            blend = (
                0.44 * m.get("cbf_score", 0.0)
                + 0.28 * m["score"]
                + 0.10 * m.get("cf_score", 0.0)
                + 0.18 * overlap
            )
            return (skill_tier, geo_tier, dist_key, -overlap, -blend)

        all_matches.sort(key=_rank_key)
        
        # Dedup matches by worker_id (if multiple jobs matched)
        seen_workers = set()
        unique_matches = []
        for match in all_matches:
            if match['worker_id'] not in seen_workers:
                unique_matches.append(match)
                seen_workers.add(match['worker_id'])
                if len(unique_matches) >= top_k:
                    break

        # Final order: closer workers first; experience breaks ties (distance > experience vs raw score).
        def _distance_over_experience_key(m: Dict) -> Tuple:
            overlap = _query_skill_overlap(query, m.get("skills") or [])
            if overlap >= 0.7:
                skill_tier = 0
            elif overlap >= 0.3:
                skill_tier = 1
            else:
                skill_tier = 2
            has_pin = target_coords is not None
            dk = m.get("distance_km")
            has_dist = dk is not None
            geo_tier = 1 if (has_pin and not has_dist) else 0
            dist_key = float(dk) if has_dist else float("inf")
            exp = float(m.get("experience_years") or 0)
            return (skill_tier, geo_tier, dist_key, -exp)

        unique_matches.sort(key=_distance_over_experience_key)

        return {
            "matches": unique_matches,
            "target_coords": target_coords,
            "empty_reason": None,
        }

    def get_map_features(
        self,
        parsed: Optional[Dict],
        matches: List[Dict],
        target_coords,
    ) -> List[Dict]:
        """
        Points for the neighborhood map (same logic as Streamlit app.py pydeck):
        red target = search / 'YOU ARE HERE', blue = worker locations from CBF geocoding.
        """
        features: List[Dict] = []
        if target_coords is not None and len(target_coords) >= 2:
            try:
                lat, lon = float(target_coords[0]), float(target_coords[1])
                label_base = (parsed or {}).get("address") or (parsed or {}).get("location") or "Search Center"
                features.append({
                    "type": "target",
                    "lat": lat,
                    "lng": lon,
                    "label": f"YOU ARE HERE ({label_base})",
                })
            except (TypeError, ValueError, IndexError):
                pass

        for m in matches or []:
            try:
                wid = m.get("worker_id")
                worker_profile = self.data_loader.get_worker(wid)
                w_coords = self.cbf._get_coordinates(worker_profile)
                if w_coords:
                    features.append({
                        "type": "worker",
                        "lat": float(w_coords[0]),
                        "lng": float(w_coords[1]),
                        "label": f"{m.get('name', 'Worker')} ({m.get('phone', '')})",
                        "worker_id": wid,
                    })
            except Exception:
                continue

        return features
    
    def _filter_jobs(self, query: Dict = None) -> List[Dict]:
        """Filter jobs based on query parameters"""
        if query is None:
            return self.jobs_cache
        
        filtered = []
        for job in self.jobs_cache:
            # Location filter
            if query.get('location'):
                job_loc = (job.get('location') or "").lower()
                query_loc = (query.get('location') or "").lower()
                if job_loc != query_loc:
                    continue
            
            # Skills filter
            if query.get('skills'):
                job_skills = [str(s).lower() for s in (job.get('required_skills') or [])]
                query_skills = [str(s).lower() for s in (query.get('skills') or [])]
                if not any(skill in job_skills for skill in query_skills):
                    continue
            
            # Wage filter
            if 'wage_max' in query and query['wage_max']:
                if job['wage_min'] > query['wage_max']:
                    continue
            
            # Work type filter
            if query.get('work_type'):
                j_type = (job.get('work_type') or "").lower()
                q_type = (query.get('work_type') or "").lower()
                if j_type != q_type:
                    continue
            
            filtered.append(job)
        
        return filtered if filtered else self.jobs_cache
    
    def _generate_explanation(self, worker: Dict, job: Dict, 
                             cbf_score: float, cf_score: float, 
                             final_score: float) -> str:
        """Generate human-readable explanation for the match"""
        reasons = []
        
        # Skill match
        worker_skills = set(str(s).lower() for s in (worker.get('skills') or []))
        job_skills = set(str(s).lower() for s in (job.get('required_skills') or []))
        common_skills = worker_skills & job_skills
        if common_skills:
            reasons.append(f"skills match ({', '.join(common_skills)})")
        
        # Location match with distance
        distance_km, distance_str = self.cbf.get_distance_info(worker, job)
        if distance_km is not None and distance_km < 5:
            reasons.append(f"very close ({distance_str} away)")
        elif distance_km is not None and distance_km < 15:
            reasons.append(f"nearby ({distance_str} away)")
        elif distance_km is not None:
            reasons.append(f"distance: {distance_str}")
        elif (worker.get('location') or "").lower() == (job.get('location') or "").lower():
            reasons.append(f"same city ({worker.get('location', 'Pune')})")
        else:
            reasons.append(f"location: {worker['location']} → {job['location']}")
        
        # Experience
        if worker['experience_years'] >= job['required_experience_years']:
            reasons.append(f"experience: {worker['experience_years']} years (required: {job['required_experience_years']})")
        else:
            reasons.append(f"experience: {worker['experience_years']} years (needs {job['required_experience_years']})")
        
        # Rating
        reasons.append(f"rating: {worker['rating']}/5.0")
        
        explanation = f"Match score: {final_score:.1%}. " + ", ".join(reasons)
        return explanation
