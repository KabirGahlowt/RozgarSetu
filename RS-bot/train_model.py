"""
Training script for CHK-SVM model
Run this to train the model on the sample dataset
"""
import math
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_loader import DataLoader
from src.cbf_filter import ContentBasedFilter
from src.cf_filter import CollaborativeFilter
from src.chk_svm import CHKSVMClassifier


def _parse_worker_id(v):
    """Legacy CSV uses int ids; MongoDB uses 24-char hex strings — never force int()."""
    if v is None or (isinstance(v, float) and math.isnan(v)):
        raise ValueError("missing worker_id")
    s = str(v).strip()
    if s.isdigit():
        return int(s)
    return s


def _parse_job_id(v):
    """Same for job ids (typically int in sample data)."""
    if v is None or (isinstance(v, float) and math.isnan(v)):
        raise ValueError("missing job_id")
    s = str(v).strip()
    if s.isdigit():
        return int(s)
    return s


def train_model():
    """Train the CHK-SVM model"""
    print("Loading data...")
    data_loader = DataLoader("data")
    workers_df, jobs_df, interactions_df = data_loader.load_data()

    # Convert to list of dicts
    workers = []
    for _, row in workers_df.iterrows():
        workers.append(data_loader.get_worker(_parse_worker_id(row["worker_id"])))

    jobs = []
    for _, row in jobs_df.iterrows():
        jobs.append(data_loader.get_job(_parse_job_id(row["job_id"])))

    print("Computing CBF scores...")
    cbf = ContentBasedFilter()
    cbf_scores = []
    for idx, row in interactions_df.iterrows():
        worker = data_loader.get_worker(_parse_worker_id(row["worker_id"]))
        job = data_loader.get_job(_parse_job_id(row["job_id"]))
        score = cbf.compute_similarity(worker, job)
        cbf_scores.append(score)

    print("Computing CF scores...")
    cf = CollaborativeFilter(interactions_df)
    cf_scores = []
    for idx, row in interactions_df.iterrows():
        worker_id = _parse_worker_id(row["worker_id"])
        job_id = _parse_job_id(row["job_id"])
        score = cf.compute_cf_score(worker_id, job_id, k=10)
        cf_scores.append(score)

    print("Training CHK-SVM model...")
    svm = CHKSVMClassifier("models/chk_svm_model.joblib")
    svm.train(workers, jobs, interactions_df, cbf_scores, cf_scores)

    print("\nTraining completed!")
    print("Model saved to models/chk_svm_model.joblib")


if __name__ == "__main__":
    train_model()
