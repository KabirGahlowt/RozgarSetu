"""
Training script for CHK-SVM model
Run this to train the model on the sample dataset
"""
import math
import sys
import os

import pandas as pd

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


def _filter_interactions_to_loaded(
    interactions_df: pd.DataFrame,
    workers_df: pd.DataFrame,
    jobs_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Keep only rows whose worker_id and job_id exist in the loaded workers/jobs.
    Drops legacy CSV ids (e.g. 1,2,3) when workers come from MongoDB (hex ids).
    """
    if interactions_df is None or interactions_df.empty:
        return interactions_df

    valid_w = {_parse_worker_id(w) for w in workers_df["worker_id"].values}
    valid_j = {_parse_job_id(j) for j in jobs_df["job_id"].values}

    def _ok(row):
        try:
            return (
                _parse_worker_id(row["worker_id"]) in valid_w
                and _parse_job_id(row["job_id"]) in valid_j
            )
        except (ValueError, KeyError):
            return False

    out = interactions_df[interactions_df.apply(_ok, axis=1)].copy()
    n0, n1 = len(interactions_df), len(out)
    if n0 != n1:
        print(
            f"[train_model] Filtered interactions: {n0} -> {n1} "
            "(dropped rows whose worker/job ids are not in loaded workers/jobs)"
        )
    return out


def _pad_if_single_row(
    interactions_df: pd.DataFrame,
    jobs_df: pd.DataFrame,
) -> pd.DataFrame:
    """train_test_split / SVC need enough rows; pad 1-row frame with a second worker-job pair."""
    if interactions_df is None or len(interactions_df) != 1 or jobs_df is None or len(jobs_df) < 2:
        return interactions_df
    r = interactions_df.iloc[0]
    wid = _parse_worker_id(r["worker_id"])
    jid0 = _parse_job_id(r["job_id"])
    alt = None
    for _, jr in jobs_df.iterrows():
        j = _parse_job_id(jr["job_id"])
        if j != jid0:
            alt = j
            break
    if alt is None:
        return interactions_df
    print("[train_model] Padded single interaction row with a second job for stable training.")
    pad = pd.DataFrame(
        [
            {
                "worker_id": wid,
                "job_id": alt,
                "rating": 3,
                "interaction_type": "synthetic_pad",
                "date": "2024-01-03",
            }
        ]
    )
    return pd.concat([interactions_df, pad], ignore_index=True)


def _synthetic_interactions_if_empty(
    interactions_df: pd.DataFrame,
    workers_df: pd.DataFrame,
    jobs_df: pd.DataFrame,
) -> pd.DataFrame:
    """If nothing matches (e.g. API workers vs sample interactions.csv), add minimal rows for SVM."""
    if not interactions_df.empty:
        return interactions_df
    if workers_df is None or workers_df.empty or jobs_df is None or jobs_df.empty:
        print("[train_model] Warning: No workers or jobs; cannot build synthetic interactions.")
        return interactions_df

    w0 = workers_df.iloc[0]
    j0 = jobs_df.iloc[0]
    j1 = jobs_df.iloc[1] if len(jobs_df) > 1 else j0
    wid = _parse_worker_id(w0["worker_id"])
    jid0 = _parse_job_id(j0["job_id"])
    jid1 = _parse_job_id(j1["job_id"])
    print(
        "[train_model] No interaction rows matched loaded workers/jobs; "
        "using two synthetic rows so CHK-SVM can train (align interactions.csv with API ids for real data)."
    )
    return pd.DataFrame(
        [
            {
                "worker_id": wid,
                "job_id": jid0,
                "rating": 5,
                "interaction_type": "synthetic",
                "date": "2024-01-01",
            },
            {
                "worker_id": wid,
                "job_id": jid1,
                "rating": 3,
                "interaction_type": "synthetic",
                "date": "2024-01-02",
            },
        ]
    )


def train_model():
    """Train the CHK-SVM model"""
    print("Loading data...")
    data_loader = DataLoader("data")
    workers_df, jobs_df, interactions_df = data_loader.load_data()

    interactions_df = _filter_interactions_to_loaded(
        interactions_df, workers_df, jobs_df
    )
    interactions_df = _pad_if_single_row(interactions_df, jobs_df)
    interactions_df = _synthetic_interactions_if_empty(
        interactions_df, workers_df, jobs_df
    )

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
