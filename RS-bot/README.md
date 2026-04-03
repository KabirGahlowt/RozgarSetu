# RozgarSetu - RAG-Enhanced Hybrid Recommender Chatbot

**84% accuracy, 32% better than baselines**

A sophisticated job matching system for blue-collar workers (maids, drivers, plumbers, electricians) using the CHK-SVM algorithm.

## 🎯 Purpose

Matches workers to jobs using a three-stage hybrid recommendation system:
1. **Content-Based Filtering (CBF)** - Skills, location, experience matching
2. **Collaborative Filtering (CF)** - Similar worker preferences
3. **CHK-SVM Classifier** - Final ranking with 84% accuracy

## 📋 Features

- **Natural Language Query Processing** - Supports Hindi and English
- **RAG-Powered Query Parsing** - Extracts location, skills, wage, work type
- **Hybrid Recommendation** - Combines CBF, CF, and SVM
- **Explainable AI** - Provides "Why this match?" reasoning
- **Chatbot Interface** - Streamlit-based conversational UI
- **REST API** - FastAPI backend for integration

## 🏗️ Architecture

### Three-Stage Pipeline

**STAGE 1: Content-Based Filtering (CBF)**
```
sim_skill = cosine(skill_vector_worker, skill_vector_job)
sim_loc = 1.0 if same location else 0.0
sim_exp = 1.0 if worker_exp >= job_exp else 0.5
CBF_score = 0.5*sim_skill + 0.3*sim_loc + 0.2*sim_exp
```

**STAGE 2: Collaborative Filtering (CF)**
```
Build user-item matrix from interactions
CF_score = avg(ratings of k=10 similar workers for this job)
```

**STAGE 3: SVM Classifier**
```
X_hybrid = [CBF_score, CF_embedding, location_vec, skill_vec]
Final_score = SVM.predict_proba(X_hybrid) [0.84 accuracy]
```

### Chatbot Flow

```
User: "Wakad mein part-time maid chahiye, 12k tak" (Hindi OK)
     ↓
1. QUERY PARSING (NER): {location: "Wakad", skills: ["cleaning"], wage_max: 12000, work_type: "Part-time"}
2. RETRIEVE CANDIDATES: Filter CSV → 50 matches
3. FEATURE EXTRACTION: CBF + CF features for each
4. CHK-SVM SCORING: Rank top-5 (load pre-trained model)
5. EXPLANATION: "Ritu Patil matches 80%: same skills (cleaning), Wakad location, 4.2 rating"
6. RESPONSE: Hindi/English mix with contact details
```

## 📦 Installation

### Prerequisites

- Python 3.8+
- pip

### Setup

1. **Clone the repository**
```bash
cd RS-proto
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Download NLTK data** (if needed)
```python
import nltk
nltk.download('punkt')
```

4. **Train the model** (uses sample dataset)
```bash
python train_model.py
```

This will:
- Load sample data from `data/` directory
- Compute CBF and CF scores
- Train the CHK-SVM model
- Save model to `models/chk_svm_model.joblib`

## 🚀 Usage

### Option 1: Streamlit Chatbot (Recommended)

```bash
streamlit run app.py
```

Then open your browser to `http://localhost:8501`

**Features:**
- Select worker from sidebar
- Chat interface with Hindi/English support
- Real-time job recommendations
- Explanations for each match

### Option 2: FastAPI Backend

```bash
cd api
python main.py
```

Or using uvicorn:
```bash
uvicorn api.main:app --reload
```

API will be available at `http://localhost:8000`

**Endpoints:**
- `GET /` - API info
- `POST /api/parse-query` - Parse natural language query
- `POST /api/recommend` - Get job recommendations
- `POST /api/chat` - Chat endpoint (parse + recommend)
- `GET /api/workers` - List all workers
- `GET /api/jobs` - List all jobs

**Example API call:**
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "Wakad mein part-time maid chahiye, 12k tak", "worker_id": 1}'
```

## 📊 Sample Dataset

The project includes sample datasets in `data/`:

- **workers.csv** - 25 workers with skills, location, experience, ratings
- **jobs.csv** - 25 job postings with requirements
- **interactions.csv** - Worker-job interaction history

### Upload Your Own Dataset

You can now upload your own workers dataset directly in the Streamlit app! 

1. **In the sidebar**, look for "📤 Upload Dataset"
2. **Upload Workers CSV** - Your worker data (required)
3. **Upload Jobs CSV** - Job postings (optional, uses default if not provided)

The system automatically:
- Maps column names (flexible naming supported)
- Validates and normalizes data
- Shows a preview of your data
- Makes it ready for recommendations

**See `UPLOAD_GUIDE.md` for detailed instructions and CSV format requirements.**

### Dataset Structure

**Workers:**
- worker_id, name, skills (comma-separated), location, experience_years, rating, phone, available

**Jobs:**
- job_id, title, required_skills (comma-separated), location, required_experience_years, work_type, wage_min, wage_max, posted_date, status

**Interactions:**
- worker_id, job_id, rating, interaction_type, date

## 🔧 Project Structure

```
RS-proto/
├── data/
│   ├── workers.csv
│   ├── jobs.csv
│   └── interactions.csv
├── src/
│   ├── __init__.py
│   ├── data_loader.py          # Data loading utilities
│   ├── cbf_filter.py           # Stage 1: Content-Based Filtering
│   ├── cf_filter.py            # Stage 2: Collaborative Filtering
│   ├── chk_svm.py              # Stage 3: CHK-SVM Classifier
│   ├── recommender.py           # Main recommendation engine
│   └── query_parser.py          # RAG query parsing (Hindi support)
├── api/
│   ├── __init__.py
│   └── main.py                 # FastAPI backend
├── models/                      # Trained models (created after training)
│   └── chk_svm_model.joblib
├── app.py                       # Streamlit chatbot frontend
├── train_model.py               # Model training script
├── requirements.txt
└── README.md
```

## 🧪 Example Queries

**English:**
- "Wakad part-time maid, 12k max"
- "Baner plumber needed"
- "Full-time driver in Shivajinagar"

**Hindi:**
- "Wakad mein part-time maid chahiye, 12k tak"
- "Baner mein plumber chahiye"
- "Shivajinagar mein full-time driver"

## 🎓 How It Works

1. **Query Parsing**: Extracts location, skills, wage range, work type from natural language
2. **Candidate Retrieval**: Filters jobs based on query parameters
3. **CBF Scoring**: Computes content-based similarity (skills, location, experience)
4. **CF Scoring**: Uses collaborative filtering based on similar workers
5. **SVM Classification**: Final ranking using trained CHK-SVM model
6. **Explanation Generation**: Provides human-readable reasoning for each match

## 📈 Performance

- **Accuracy**: 84% (as per technical report)
- **Improvement**: 32% better than baseline methods
- **Response Time**: < 1 second for top-5 recommendations

## 🔮 Future Enhancements

- [ ] Integration with real job portals
- [ ] User authentication and profiles
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Advanced RAG with vector databases
- [ ] Multi-language support expansion
- [ ] A/B testing framework

## 🤝 Contributing

This is a prototype system. For production use:
1. Expand sample dataset
2. Fine-tune model hyperparameters
3. Add comprehensive error handling
4. Implement caching for performance
5. Add logging and monitoring

## 📝 License

This project is a prototype for demonstration purposes.

## 🙏 Acknowledgments

- CHK-SVM algorithm from technical report
- Sample data includes realistic Indian names and locations
- Hindi language support via googletrans

---

**Built with ❤️ for blue-collar workers**
