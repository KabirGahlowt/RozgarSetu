
import pandas as pd
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

target_lat, target_lng = 18.5913, 73.7190 # Hinjewadi Phase 3

print("Loading data...")
df1 = pd.read_csv("data/test_addresses.csv")
df2 = pd.read_csv("data/syn_workers.csv")
df = pd.concat([df1, df2])

print(f"Total workers: {len(df)}")
cooks = df[df['skills'].str.contains('cook', case=False, na=False)].copy()
print(f"Cooks found: {len(cooks)}")

# Hardcoded area coords for Pune areas to avoid geopy overhead
area_coords = {
    "hinjewadi": (18.5913, 73.7190),
    "wakad": (18.6022, 73.7644),
    "baner": (18.5642, 73.7769),
    "aundh": (18.5619, 73.8102),
    "kothrud": (18.5071, 73.8051),
    "pimple saudagar": (18.5987, 73.7888),
    "balewadi": (18.5760, 73.7799),
    "hadapsar": (18.5008, 73.9379)
}

results = []
for _, row in cooks.iterrows():
    city = str(row['city']).lower()
    location = str(row.get('location', '')).lower()
    
    coords = None
    # Check if area is in our hardcoded list
    for area, c in area_coords.items():
        if area in city or area in location or area in str(row['address']).lower():
            coords = c
            break
    
    if coords:
        dist = haversine(target_lat, target_lng, coords[0], coords[1])
        results.append({
            'name': row['fullname'],
            'dist': dist,
            'addr': f"{row['address']}, {row['city']}"
        })

results.sort(key=lambda x: x['dist'])

print("\nTop 5 Cooks near Hinjewadi Phase 3:")
for i, r in enumerate(results[:5]):
    print(f"{i+1}. {r['name']} - {r['dist']:.2f} km - {r['addr']}")
