"""
Stage 1: Content-Based Filtering (CBF)
Computes similarity based on skills, location (distance), and experience
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional, Tuple
import numpy as np
from .geocoding_utils import get_geocoder
from .distance_calculator import DistanceCalculator, format_distance


class ContentBasedFilter:
    def __init__(self, use_distance_based_location: bool = True, provider: str = "nominatim", api_key: Optional[str] = None):
        """
        Initialize Content-Based Filter
        
        Args:
            use_distance_based_location: If True, use distance-based location scoring
            provider: Geocoding provider ('nominatim' for free, 'google' for Google Maps)
            api_key: API key for paid providers (Google)
        """
        self.vectorizer = TfidfVectorizer()
        self.skill_vectors = None
        self.use_distance_based_location = use_distance_based_location
        self.geocoder = get_geocoder(provider, api_key) if use_distance_based_location else None
        self.distance_calculator = DistanceCalculator() if use_distance_based_location else None
        self.coordinates_cache = {}  # Cache for geocoded coordinates
        
    def _get_coordinates(self, address_dict: Dict) -> Optional[Tuple[float, float]]:
        """
        Get coordinates for an address, using cache
        
        Args:
            address_dict: Dictionary with 'full_address', 'address', 'location', 'pincode' keys
        
        Returns:
            Tuple of (latitude, longitude) or None
        """
        # Try full_address first
        full_address = address_dict.get('full_address', '')
        
        # Check cache
        if full_address in self.coordinates_cache:
            return self.coordinates_cache[full_address]
        
        # Geocode
        if self.geocoder:
            address = address_dict.get('address', '')
            city = address_dict.get('location', '')
            pincode = address_dict.get('pincode', '')
            
            coords = self.geocoder.geocode_address(address, city, pincode)
            self.coordinates_cache[full_address] = coords
            return coords
        
        return None
    
    def compute_similarity(self, worker: Dict, job: Dict) -> float:
        """
        Compute CBF score:
        CBF_score = 0.7*sim_skill + 0.2*sim_loc + 0.1*sim_exp
        
        Prioritization: Skill (Highest) > Distance > Experience (Lowest)
        """
        # Skill similarity (cosine similarity)
        worker_skills = " ".join(worker.get("skills") or [])
        job_skills = " ".join(job.get("required_skills") or [])
        # TfidfVectorizer raises if both documents are empty (no vocabulary)
        if not worker_skills.strip() and not job_skills.strip():
            sim_skill = 0.5
        elif not worker_skills.strip() or not job_skills.strip():
            sim_skill = 0.0
        else:
            skill_texts = [worker_skills, job_skills]
            skill_vectors = self.vectorizer.fit_transform(skill_texts)
            sim_skill = cosine_similarity(skill_vectors[0:1], skill_vectors[1:2])[0][0]
        
        # Location similarity
        if self.use_distance_based_location:
            # Distance-based scoring
            worker_coords = self._get_coordinates(worker)
            job_coords = self._get_coordinates(job)
            
            if worker_coords and job_coords:
                distance, sim_loc = self.distance_calculator.calculate(worker_coords, job_coords)
                # Store distance for later use in explanations
                if hasattr(self, '_last_distance'):
                    self._last_distance = distance
            else:
                # Fallback to binary matching if geocoding fails
                w_loc = (worker.get('location') or "").lower()
                j_loc = (job.get('location') or "").lower()
                sim_loc = 1.0 if w_loc == j_loc and w_loc != "" else 0.0
        else:
            # Binary location matching (legacy)
            w_loc = (worker.get('location') or "").lower()
            j_loc = (job.get('location') or "").lower()
            sim_loc = 1.0 if w_loc == j_loc and w_loc != "" else 0.0
        
        # Experience similarity
        if worker['experience_years'] >= job['required_experience_years']:
            sim_exp = 1.0
        else:
            # Partial credit if close
            exp_diff = job['required_experience_years'] - worker['experience_years']
            sim_exp = max(0.0, 1.0 - (exp_diff * 0.1))
        
        # Weighted combination (Prioritized: Skill > Distance > Experience)
        if self.use_distance_based_location:
            cbf_score = 0.7 * sim_skill + 0.2 * sim_loc + 0.1 * sim_exp
        else:
            cbf_score = 0.7 * sim_skill + 0.2 * sim_loc + 0.1 * sim_exp
        
        return float(cbf_score)
    
    def compute_similarities_batch(self, worker: Dict, jobs: List[Dict]) -> List[float]:
        """Compute CBF scores for a worker against multiple jobs"""
        scores = []
        for job in jobs:
            score = self.compute_similarity(worker, job)
            scores.append(score)
        return scores
    
    def get_distance_info(self, worker: Dict, job: Dict) -> Tuple[Optional[float], str]:
        """
        Get distance information between worker and job locations
        
        Args:
            worker: Worker dictionary
            job: Job dictionary
        
        Returns:
            Tuple of (distance_km, formatted_distance_string)
        """
        if not self.use_distance_based_location:
            return None, "N/A"
        
        worker_coords = self._get_coordinates(worker)
        job_coords = self._get_coordinates(job)
        
        if worker_coords and job_coords:
            distance, _ = self.distance_calculator.calculate(worker_coords, job_coords)
            return distance, format_distance(distance)
        
        return None, "Unknown"
