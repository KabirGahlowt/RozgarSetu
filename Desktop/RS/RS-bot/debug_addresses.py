
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.data_loader import DataLoader
import pandas as pd

loader = DataLoader()
workers_df, jobs_df, _ = loader.load_data("data/syn_workers.csv", "data/jobs.csv")

print("Workers Columns:", workers_df.columns.tolist())
print("Jobs Columns:", jobs_df.columns.tolist())

worker_addresses = []
for i, row in workers_df.iterrows():
    address = row.get('address', '')
    city = row.get('city', row.get('location', ''))
    pincode = row.get('pincode', '')
    worker_addresses.append((address, city, pincode))

job_addresses = []
for i, row in jobs_df.iterrows():
    address = row.get('address', '')
    city = row.get('city', row.get('location', ''))
    pincode = row.get('pincode', '')
    job_addresses.append((address, city, pincode))

all_addresses = list(set(worker_addresses + job_addresses))
print(f"Total Unique Addresses: {len(all_addresses)}")
print("Sample addresses:")
for addr in list(all_addresses)[:20]:
    print(f"  - {addr}")

# Check for '1'
for addr in all_addresses:
    if addr[0] == '1' or addr[0] == 1:
        print(f"Found '1' in address: {addr}")
