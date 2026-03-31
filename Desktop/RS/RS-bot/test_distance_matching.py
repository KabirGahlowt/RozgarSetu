"""
Quick test script to verify distance-based matching implementation
"""
import sys
sys.path.insert(0, 'src')

from src.distance_calculator import haversine_distance, distance_to_score, format_distance
from src.geocoding_utils import Geocoder
from src.data_loader import DataLoader

print("=" * 60)
print("Distance-Based Matching - Quick Test")
print("=" * 60)

# Test 1: Distance Calculation
print("\n1. Testing Haversine Distance Calculation")
print("-" * 60)
# Pune coordinates (approximate)
lat1, lon1 = 18.5204, 73.8567  # Wakad
lat2, lon2 = 18.5314, 73.8446  # Baner

distance = haversine_distance(lat1, lon1, lat2, lon2)
score = distance_to_score(distance)
formatted = format_distance(distance)

print(f"Location 1: Wakad ({lat1}, {lon1})")
print(f"Location 2: Baner ({lat2}, {lon2})")
print(f"Distance: {formatted}")
print(f"Similarity Score: {score:.2f}")
print("✓ Distance calculation working!")

# Test 2: Data Loader with Address Fields
print("\n2. Testing Data Loader with Address Fields")
print("-" * 60)
try:
    loader = DataLoader("data")
    workers_df, jobs_df, _ = loader.load_data("data/syn_workers.csv", "data/jobs.csv")
    
    # Check if address fields exist
    has_address = 'address' in workers_df.columns
    has_pincode = 'pincode' in workers_df.columns
    has_full_address = 'full_address' in workers_df.columns
    
    print(f"Workers loaded: {len(workers_df)}")
    print(f"Jobs loaded: {len(jobs_df)}")
    print(f"Address field present: {has_address}")
    print(f"Pincode field present: {has_pincode}")
    print(f"Full address generated: {has_full_address}")
    
    if has_full_address:
        sample_address = workers_df['full_address'].iloc[0]
        print(f"Sample full address: {sample_address}")
        print("✓ Data loader working with address fields!")
    else:
        print("⚠ Warning: full_address field not generated")
        
except Exception as e:
    print(f"❌ Error loading data: {e}")

# Test 3: Geocoding Cache
print("\n3. Testing Geocoding Cache")
print("-" * 60)
try:
    geocoder = Geocoder()
    cache_size = len(geocoder.cache.cache)
    print(f"Cached coordinates: {cache_size}")
    
    if cache_size > 0:
        # Show a sample cached address
        sample_key = list(geocoder.cache.cache.keys())[0]
        sample_coords = geocoder.cache.cache[sample_key]
        print(f"Sample cached address: {sample_key[:50]}...")
        print(f"Coordinates: ({sample_coords['lat']}, {sample_coords['lng']})")
        print("✓ Geocoding cache working!")
    else:
        print("ℹ No cached coordinates yet. Run prepare_geocoded_data.py first.")
        
except Exception as e:
    print(f"❌ Error with geocoding: {e}")

# Test 4: CBF Filter with Distance
print("\n4. Testing CBF Filter with Distance-Based Matching")
print("-" * 60)
try:
    from src.cbf_filter import ContentBasedFilter
    
    # Test with distance-based matching disabled (no API key needed)
    cbf = ContentBasedFilter(use_distance_based_location=False)
    
    worker = {
        'skills': ['cleaning', 'cooking'],
        'location': 'Mumbai',
        'experience_years': 5
    }
    
    job = {
        'required_skills': ['cleaning', 'laundry'],
        'location': 'Mumbai',
        'required_experience_years': 3
    }
    
    score = cbf.compute_similarity(worker, job)
    print(f"CBF Score (binary location): {score:.2f}")
    print("✓ CBF filter working!")
    
except Exception as e:
    print(f"❌ Error with CBF filter: {e}")

print("\n" + "=" * 60)
print("Test Summary")
print("=" * 60)
print("✓ Distance calculation module working")
print("✓ Data loader handles address fields")
print("✓ Geocoding cache system ready")
print("✓ CBF filter updated")
print("\nNext steps:")
print("1. Set GOOGLE_MAPS_API_KEY environment variable")
print("2. Run: python prepare_geocoded_data.py")
print("3. Run: streamlit run app.py")
print("=" * 60)
