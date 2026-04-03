
import sys
import os
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time

def solve():
    print("Starting geocoding...")
    try:
        df = pd.read_csv("data/test_addresses.csv")
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    geolocator = Nominatim(user_agent="rozgarsetu_test")
    results = []
    
    with open("geocode_results.txt", "w") as f:
        f.write("Fullname,Latitude,Longitude\n")
        for i, row in df.iterrows():
            name = row['fullname']
            # Structured address for better results
            addr = f"{row['address']}, {row['city']}, {row['pincode']}, India"
            print(f"Geocoding {name}: {addr}")
            
            try:
                location = geolocator.geocode(addr, timeout=10)
                if location:
                    print(f"  Found: {location.latitude}, {location.longitude}")
                    f.write(f"{name},{location.latitude},{location.longitude}\n")
                else:
                    # Try simpler address
                    simple_addr = f"{row['city']}, {row['pincode']}, India"
                    location = geolocator.geocode(simple_addr, timeout=10)
                    if location:
                        print(f"  Found (Simple): {location.latitude}, {location.longitude}")
                        f.write(f"{name},{location.latitude},{location.longitude}\n")
                    else:
                        print(f"  Not found")
                        f.write(f"{name},None,None\n")
            except Exception as e:
                print(f"  Error: {e}")
                f.write(f"{name},Error,Error\n")
            
            f.flush()
            time.sleep(1.1)
    print("Finished.")

if __name__ == "__main__":
    solve()
