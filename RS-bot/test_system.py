"""
Quick test script to verify the system works
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_loader import DataLoader
from src.query_parser import QueryParser
from src.recommender import RozgarSetuRecommender

def test_system():
    """Test basic functionality"""
    print("=" * 50)
    print("RozgarSetu System Test")
    print("=" * 50)
    
    # Test 1: Data Loading
    print("\n1. Testing data loading...")
    data_loader = DataLoader("data")
    workers_df, jobs_df, interactions_df = data_loader.load_data()
    print(f"   ✓ Loaded {len(workers_df)} workers")
    print(f"   ✓ Loaded {len(jobs_df)} jobs")
    print(f"   ✓ Loaded {len(interactions_df)} interactions")
    
    # Test 2: Query Parsing
    print("\n2. Testing query parsing...")
    parser = QueryParser()
    test_queries = [
        "Wakad mein part-time maid chahiye, 12k tak",
        "Baner plumber needed",
        "Full-time driver in Shivajinagar"
    ]
    for query in test_queries:
        parsed = parser.parse(query)
        print(f"   Query: '{query}'")
        print(f"   Parsed: {parsed}")
    
    # Test 3: Recommendation (if model exists)
    print("\n3. Testing recommendations...")
    recommender = RozgarSetuRecommender()
    
    if recommender.svm.is_trained:
        print("   ✓ Model loaded successfully")
        worker_id = 1
        matches = recommender.get_top_matches(worker_id=worker_id, top_k=3)
        print(f"   ✓ Found {len(matches)} matches for worker {worker_id}")
        if matches:
            print(f"   Top match: {matches[0]['title']} (Score: {matches[0]['score']:.2%})")
    else:
        print("   ⚠ Model not trained yet. Run 'python train_model.py' first.")
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("=" * 50)

if __name__ == "__main__":
    test_system()
