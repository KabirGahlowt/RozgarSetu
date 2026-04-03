
import sys
import os
from pathlib import Path
sys.path.insert(0, str(Path.cwd() / 'src'))

from geocoding_utils import Geocoder
import pandas as pd
import time

def manual_geocode():
    workers_file = "data/Test addresses.csv"
    df = pd.read_csv(workers_file)
    geocoder = Geocoder()
    
    print(f"Loaded {len(df)} addresses from {workers_file}")
    
    results = []
    for i, row in df.iterrows():
        address = row.get('address', '')
        city = row.get('city', '')
        pincode = row.get('pincode', '')
        
        print(f"Geocoding: {address}, {city}, {pincode}")
        coords = geocoder.geocode_address(address, city, pincode)
        if coords:
            print(f"  Result: {coords}")
        else:
            print(f"  Failed")
        # Rate limit
        time.sleep(1.1)
    
    print("Manual geocoding complete. Cache should be updated.")

if __name__ == "__main__":
    manual_geocode()
