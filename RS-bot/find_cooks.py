
import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd() / 'src'))

from src.data_loader import DataLoader
from src.distance_calculator import haversine_distance
from src.geocoding_utils import Geocoder
import pandas as pd

def find_cooks_near():
    # Target location: Hinjewadi Phase 3
    target_addr = "Hinjewadi Phase 3, Pune, 411057, India"
    geocoder = Geocoder()
    
    # Try area-level cache for Hinjewadi
    target_coords = geocoder.cache.get(", hinjewadi, india")
    if not target_coords:
        target_coords = (18.5913, 73.7190) # Hardcoded fallback
    
    print(f"Target Coordinates (Hinjewadi): {target_coords}")

    loader = DataLoader()
    try:
        workers_df, _, _ = loader.load_data("data/test_addresses.csv", "data/jobs.csv")
    except:
        workers_df = pd.DataFrame()
        
    try:
        syn_workers_df, _, _ = loader.load_data("data/syn_workers.csv", "data/jobs.csv")
        workers_df = pd.concat([workers_df, syn_workers_df], ignore_index=True)
    except:
        pass

    # Filter for cooks
    cooks = workers_df[workers_df['skills'].str.contains('cook', case=False, na=False)]
    print(f"Total cooks found: {len(cooks)}")

    results = []
    for _, worker in cooks.iterrows():
        worker_addr = worker.get('address', '')
        worker_city = worker.get('city', '')
        worker_pincode = worker.get('pincode', '')
        
        # Fast lookup in cache
        full_address = f"{worker_addr}, {worker_city}, {worker_pincode}, India".lower()
        coords = geocoder.cache.get(full_address)
        
        if not coords:
            # Try area-level cache
            area_addr = f", {worker_city}, india".lower()
            coords = geocoder.cache.get(area_addr)
        
        if coords:
            dist = haversine_distance(target_coords[0], target_coords[1], coords[0], coords[1])
            results.append({
                'name': worker['fullname'],
                'skills': worker['skills'],
                'address': f"{worker_addr}, {worker_city}",
                'distance': dist,
                'experience': worker.get('experienceYears', 'N/A')
            })

    # Sort by distance
    results.sort(key=lambda x: x['distance'])
    
    print(f"\nFound {len(results)} cooks with location data.")
    print("\nTop 5 Closest Cooks to Hinjewadi Phase 3:")
    print("-" * 60)
    for i, res in enumerate(results[:5]):
        print(f"{i+1}. {res['name']} ({res['distance']:.2f} km)")
        print(f"   Skills: {res['skills']}")
        print(f"   Experience: {res['experience']} years")
        print(f"   Address: {res['address']}")
        print("-" * 60)

if __name__ == "__main__":
    find_cooks_near()
