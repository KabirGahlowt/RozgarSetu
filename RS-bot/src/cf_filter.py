"""
Stage 2: Collaborative Filtering (CF)
Uses user-item matrix and finds similar workers
"""
from __future__ import annotations
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple, Optional, Any
from collections import defaultdict


def _resolve_axis_key(axis: pd.Index, key: Any) -> Optional[Any]:
    """Match DataFrame index/column labels when ids are int in CSV vs str (Mongo)."""
    if axis is None or len(axis) == 0:
        return None
    if key in axis:
        return key
    sk = str(key)
    if sk in axis:
        return sk
    if sk.isdigit():
        ik = int(sk)
        if ik in axis:
            return ik
    return None


class CollaborativeFilter:
    def __init__(self, interactions_df: pd.DataFrame):
        self.interactions_df = interactions_df
        self.user_item_matrix = None
        self.worker_similarities = None
        self._build_matrix()
        self._compute_similarities()
    
    def update_interactions(self, interactions_df: pd.DataFrame):
        """Update interactions and rebuild matrices"""
        if interactions_df is not None:
            self.interactions_df = interactions_df
            self._build_matrix()
            self._compute_similarities()

    def _build_matrix(self):
        """Build user-item (worker-job) matrix"""
        if self.interactions_df is None or self.interactions_df.empty:
            self.user_item_matrix = pd.DataFrame()
            return

        # Create pivot table: workers x jobs with ratings
        try:
            self.user_item_matrix = self.interactions_df.pivot_table(
                index='worker_id',
                columns='job_id',
                values='rating',
                fill_value=0
            )
        except Exception:
            self.user_item_matrix = pd.DataFrame()
    
    def _compute_similarities(self):
        """Compute worker-to-worker similarity matrix"""
        if self.user_item_matrix is not None and len(self.user_item_matrix) > 1:
            self.worker_similarities = cosine_similarity(self.user_item_matrix)
        else:
            self.worker_similarities = np.array([[1.0]])
    
    def get_similar_workers(self, worker_id, k: int = 10) -> List[Tuple[Any, float]]:
        """Get k most similar workers"""
        if self.user_item_matrix is None or self.user_item_matrix.empty:
            return []
        wid = _resolve_axis_key(self.user_item_matrix.index, worker_id)
        if wid is None:
            return []
        
        try:
            worker_idx = list(self.user_item_matrix.index).index(wid)
            similarities = self.worker_similarities[worker_idx]
        except ValueError:
            return []
        
        # Get top k similar workers (excluding self)
        similar_workers = []
        for idx, sim in enumerate(similarities):
            if idx != worker_idx and sim > 0:
                similar_workers.append((self.user_item_matrix.index[idx], float(sim)))
        
        similar_workers.sort(key=lambda x: x[1], reverse=True)
        return similar_workers[:k]
    
    def compute_cf_score(self, worker_id, job_id, k: int = 10) -> float:
        """
        Compute CF score: average ratings of k similar workers for this job
        """
        if self.user_item_matrix is None or self.user_item_matrix.empty:
            return 0.0
        wid = _resolve_axis_key(self.user_item_matrix.index, worker_id)
        jid = _resolve_axis_key(self.user_item_matrix.columns, job_id)
        if wid is None or jid is None:
            return 0.0
        
        similar_workers = self.get_similar_workers(wid, k)
        
        if not similar_workers:
            return 0.0
        
        # Get ratings from similar workers for this job
        ratings = []
        for similar_worker_id, similarity in similar_workers:
            if similar_worker_id in self.user_item_matrix.index and jid in self.user_item_matrix.columns:
                rating = self.user_item_matrix.loc[similar_worker_id, jid]
                if rating > 0:
                    # Weight by similarity
                    ratings.append(rating * similarity)
        
        if ratings:
            cf_score = np.mean(ratings) / 5.0  # Normalize to [0, 1]
        else:
            cf_score = 0.0
        
        return float(cf_score)
    
    def compute_cf_scores_batch(self, worker_id, job_ids: List, k: int = 10) -> List[float]:
        """Compute CF scores for multiple jobs"""
        scores = []
        for job_id in job_ids:
            score = self.compute_cf_score(worker_id, job_id, k)
            scores.append(score)
        return scores
