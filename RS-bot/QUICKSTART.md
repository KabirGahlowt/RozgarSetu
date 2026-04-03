# Quick Start Guide

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Train the Model

The sample dataset is already included. Train the model:

```bash
python train_model.py
```

This will:
- Load data from `data/workers.csv`, `data/jobs.csv`, `data/interactions.csv`
- Compute CBF and CF scores
- Train CHK-SVM model
- Save to `models/chk_svm_model.joblib`

**Expected output:**
```
Loading data...
Computing CBF scores...
Computing CF scores...
Training CHK-SVM model...
CHK-SVM Training Accuracy: XX.XX%
CHK-SVM Test Accuracy: XX.XX%
Model saved to models/chk_svm_model.joblib
Training completed!
```

## Step 3: Run the Chatbot

### Option A: Streamlit (Recommended for testing)

```bash
streamlit run app.py
```

Open browser to `http://localhost:8501`

### Option B: FastAPI Backend

```bash
python api/main.py
```

Or:
```bash
uvicorn api.main:app --reload
```

API available at `http://localhost:8000`

## Step 4: Test the System

### In Streamlit:
1. Select a worker from the sidebar (e.g., "Ritu Patil")
2. Type a query: "Wakad mein part-time maid chahiye, 12k tak"
3. See top-5 job matches with explanations

### Via API:
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "Wakad mein part-time maid chahiye, 12k tak", "worker_id": 1}'
```

## Sample Queries to Try

**English:**
- "Wakad part-time maid, 12k max"
- "Baner plumber needed"
- "Full-time driver in Shivajinagar"

**Hindi:**
- "Wakad mein part-time maid chahiye, 12k tak"
- "Baner mein plumber chahiye"
- "Shivajinagar mein full-time driver"

## Troubleshooting

### Model not found error
- Make sure you ran `python train_model.py` first
- Check that `models/chk_svm_model.joblib` exists

### Import errors
- Ensure you're in the project root directory
- Verify all dependencies are installed: `pip list`

### Translation not working
- googletrans may have rate limits
- System will fallback to English-only parsing if translation fails

### No matches found
- Try a broader query (remove location or wage constraints)
- Check that jobs.csv has open jobs matching your criteria

## Next Steps

1. **Expand Dataset**: Add more workers and jobs to `data/` CSV files
2. **Fine-tune Model**: Adjust hyperparameters in `src/chk_svm.py`
3. **Add Features**: Enhance query parser with more keywords
4. **Integrate**: Connect to real job portals or databases
