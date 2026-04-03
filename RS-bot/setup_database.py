"""
Setup SQLite database from CSV files
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_loader import DataLoader

def setup_db():
    """Initialize database"""
    print("Setting up database...")
    data_loader = DataLoader("data")
    data_loader.load_data()
    db_path = data_loader.setup_database("rozgarsetu.db")
    print(f"Database created at {db_path}")
    print("Tables created: workers, jobs, interactions")

if __name__ == "__main__":
    setup_db()
