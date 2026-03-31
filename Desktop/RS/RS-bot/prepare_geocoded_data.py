"""
Prepare geocoded data - One-time script to geocode all addresses in dataset
This pre-populates the geocoding cache to avoid repeated API calls
"""
import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.data_loader import DataLoader
from src.geocoding_utils import Geocoder
import pandas as pd


def prepare_geocoded_data(
    workers_file: str = "data/test_addresses.csv",
    jobs_file: str = "data/jobs.csv",
    provider: str = "nominatim",
    api_key: str = None
):
    """
    Geocode all addresses in workers and jobs datasets
    
    Args:
        workers_file: Path to workers CSV
        jobs_file: Path to jobs CSV
        provider: Geocoding provider ('nominatim' for free, 'google' for Google Maps)
        api_key: API key for paid providers (Google)
    """
    print("=" * 60)
    print("RozgarSetu - Geocoding Preparation Script")
    print("=" * 60)
    
    # Get API key if using Google
    if provider == "google":
        if not api_key:
            api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        
        if not api_key:
            print("\n[WARNING] Google provider requires API key!")
            print("Falling back to Nominatim (free, no API key needed)")
            provider = "nominatim"
    
    print(f"\n[*] Using geocoding provider: {provider.upper()}")
    if provider == "nominatim":
        print("[OK] Nominatim is FREE and requires no API key")
        print("[WARNING] Rate limit: 1 request/second (geocoding will be slower)")
    
    # Initialize geocoder
    geocoder = Geocoder(provider, api_key)
    
    # Load data
    print("\n[FILE] Loading datasets...")
    loader = DataLoader()
    
    try:
        workers_df, jobs_df, _ = loader.load_data(workers_file, jobs_file)
        print(f"[OK] Loaded {len(workers_df)} workers")
        print(f"[OK] Loaded {len(jobs_df)} jobs")
    except Exception as e:
        print(f"[ERROR] Error loading data: {e}")
        return
    
    # Prepare addresses to geocode
    print("\n[MAP] Preparing addresses for geocoding...")
    
    # Workers addresses
    worker_addresses = []
    for _, row in workers_df.iterrows():
        address = row.get('address', '')
        city = row.get('city', row.get('location', ''))
        pincode = row.get('pincode', '')
        worker_addresses.append((address, city, pincode))
    
    # Jobs addresses
    job_addresses = []
    for _, row in jobs_df.iterrows():
        address = row.get('address', '')
        city = row.get('city', row.get('location', ''))
        pincode = row.get('pincode', '')
        job_addresses.append((address, city, pincode))
    
    # Combine and deduplicate
    all_addresses = list(set(worker_addresses + job_addresses))
    print(f"[OK] Found {len(all_addresses)} unique addresses to geocode")
    
    # Check how many are already cached
    cached_count = 0
    for address, city, pincode in all_addresses:
        full_address = f"{address}, {city}, {pincode}, India"
        if geocoder.cache.get(full_address):
            cached_count += 1
    
    print(f"[OK] {cached_count} addresses already in cache")
    print(f"[OK] {len(all_addresses) - cached_count} addresses need geocoding")
    
    # Check if we can geocode (Nominatim doesn't need API key, Google does)
    if provider == "google" and not api_key and cached_count < len(all_addresses):
        print("\n[WARNING] Cannot geocode new addresses without API key!")
        print("Using cached coordinates only.\n")
        return
    
    # Geocode addresses
    if len(all_addresses) - cached_count > 0:
        print(f"\n[*] Geocoding {len(all_addresses) - cached_count} addresses...")
        print("This may take a few minutes depending on the number of addresses...")
        if provider == "nominatim":
            print("(Nominatim rate limit: 1 request/second)")
        else:
            print("(Google Maps API allows 50 requests/second)")
        
        def progress_callback(current, total):
            if current % 50 == 0 or current == total:
                print(f"  Progress: {current}/{total} ({current*100//total}%)")
        
        results = geocoder.batch_geocode(all_addresses, progress_callback)
        
        # Count successes and failures
        success_count = sum(1 for coords in results.values() if coords is not None)
        failure_count = len(results) - success_count
        
        print(f"\n[OK] Geocoding complete!")
        print(f"  Success: {success_count}")
        print(f"  Failed: {failure_count}")
        
        if failure_count > 0:
            print(f"\n[WARNING] {failure_count} addresses could not be geocoded.")
            print("These will fall back to city-level matching.")
    
    # Generate report
    print("\n" + "=" * 60)
    print("REPORT: GEOCODING")
    print("=" * 60)
    print(f"Total unique addresses: {len(all_addresses)}")
    print(f"Cached coordinates: {len(geocoder.cache.cache)}")
    print(f"Cache file: {geocoder.cache.cache_file}")
    print(f"API requests made: {geocoder.request_count}")
    print("=" * 60)
    
    print("\n[DONE] Geocoding preparation complete!")
    print("The system is now ready to use distance-based matching.\n")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Prepare geocoded data for RozgarSetu")
    parser.add_argument('--workers', default='data/syn_workers.csv', help='Path to workers CSV')
    parser.add_argument('--jobs', default='data/jobs.csv', help='Path to jobs CSV')
    parser.add_argument('--provider', default='nominatim', choices=['nominatim', 'google'], 
                        help='Geocoding provider (default: nominatim - free)')
    parser.add_argument('--api-key', help='API key for paid providers (Google)')
    
    args = parser.parse_args()
    
    prepare_geocoded_data(args.workers, args.jobs, args.provider, args.api_key)
