"""
Stage 3: CHK-SVM Classifier
Hybrid model combining CBF, CF, and additional features
"""
import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from typing import List, Dict, Tuple
import pandas as pd


class CHKSVMClassifier:
    def __init__(self, model_path: str = "models/chk_svm_model.joblib"):
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Try to load existing model
        if os.path.exists(model_path):
            self.load_model()
    
    def _extract_features(self, cbf_score: float, cf_score: float, 
                         worker: Dict, job: Dict) -> np.ndarray:
        """
        Extract hybrid features:
        X_hybrid = [CBF_score, CF_score, location_match, skill_overlap, 
                   exp_match, rating_normalized, wage_match]
        """
        # Location match (binary)
        w_loc = (worker.get('location') or "").lower()
        j_loc = (job.get('location') or "").lower()
        location_match = 1.0 if w_loc == j_loc and w_loc != "" else 0.0
        
        # Skill overlap ratio
        worker_skills = set(worker['skills'])
        job_skills = set(job['required_skills'])
        skill_overlap = len(worker_skills & job_skills) / max(len(job_skills), 1)
        
        # Experience match (normalized)
        exp_match = min(1.0, worker['experience_years'] / max(job['required_experience_years'], 1))
        
        # Rating normalized
        rating_norm = worker['rating'] / 5.0
        
        # Wage match (check if worker's expected wage fits job range)
        # For now, assume workers accept jobs in the wage range
        wage_match = 1.0  # Can be enhanced with worker wage preferences
        
        features = np.array([
            cbf_score,
            cf_score,
            location_match,
            skill_overlap,
            exp_match,
            rating_norm,
            wage_match
        ])
        
        return features
    
    def train(self, workers: List[Dict], jobs: List[Dict], 
              interactions: pd.DataFrame, cbf_scores: List[float],
              cf_scores: List[float]):
        """
        Train CHK-SVM model
        Labels: 1 if interaction rating >= 4, else 0
        """
        X = []
        y = []
        
        # Build feature matrix from interactions
        for idx, row in interactions.iterrows():
            worker_id = row['worker_id']
            job_id = row['job_id']
            rating = row['rating']
            
            # Find worker and job
            worker = next((w for w in workers if w['worker_id'] == worker_id), None)
            job = next((j for j in jobs if j['job_id'] == job_id), None)
            
            if worker and job:
                # Get CBF and CF scores (simplified - in practice, compute these)
                cbf = cbf_scores[idx] if idx < len(cbf_scores) else 0.5
                cf = cf_scores[idx] if idx < len(cf_scores) else 0.5
                
                features = self._extract_features(cbf, cf, worker, job)
                X.append(features)
                
                # Label: 1 if rating >= 4 (positive match), else 0
                y.append(1 if rating >= 4 else 0)
        
        if len(X) == 0:
            print("Warning: No training data available")
            return
        
        X = np.array(X)
        y = np.array(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train SVM
        self.model = SVC(kernel='rbf', probability=True, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        print(f"CHK-SVM Training Accuracy: {train_score:.2%}")
        print(f"CHK-SVM Test Accuracy: {test_score:.2%}")
        
        self.is_trained = True
        self.save_model()
    
    def predict_proba(self, cbf_score: float, cf_score: float,
                     worker: Dict, job: Dict) -> float:
        """
        Predict match probability using trained model
        Returns probability of positive match [0, 1]
        """
        if not self.is_trained or self.model is None:
            # Fallback: weighted average if model not trained
            return 0.6 * cbf_score + 0.4 * cf_score
        
        features = self._extract_features(cbf_score, cf_score, worker, job)
        features_scaled = self.scaler.transform([features])
        
        # Get probability of positive class
        proba = self.model.predict_proba(features_scaled)[0][1]
        return float(proba)
    
    def save_model(self):
        """Save model and scaler"""
        if self.model is not None:
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler
            }, self.model_path)
            print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load model and scaler"""
        try:
            data = joblib.load(self.model_path)
            self.model = data['model']
            self.scaler = data['scaler']
            self.is_trained = True
            print(f"Model loaded from {self.model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.is_trained = False
