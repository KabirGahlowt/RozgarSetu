
import pandas as pd
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

# Realistic coordinates for societies in Hinjewadi
SOCIETY_COORDS = {
    "melange residences": (18.5912, 73.7015),
    "eon homes": (18.5834, 73.6985),
    "megapolis": (18.5772, 73.6885),
    "kohinoor coral": (18.5825, 73.7124),
    "vedanta": (18.5986, 73.7651),
    "livmo": (18.5885, 73.7050),
    "saffron": (18.5860, 73.7030),
    "sunway": (18.5750, 73.6900),
    "splendour": (18.5840, 73.6995),
    "wakad": (18.6022, 73.7644),
    "baner": (18.5642, 73.7769),
    "pimple saudagar": (18.5987, 73.7888)
}

target_lat, target_lng = SOCIETY_COORDS["melange residences"]

print("Loading data...")
df1 = pd.read_csv("data/test_addresses.csv")
df2 = pd.read_csv("data/syn_workers.csv")
df = pd.concat([df1, df2])

print(f"Total workers: {len(df)}")
cooks = df[df['skills'].str.contains('cook', case=False, na=False)].copy()

results = []
for _, row in cooks.iterrows():
    addr = str(row['address']).lower()
    city = str(row['city']).lower()
    
    coords = None
    # Check if address contains one of our societies
    for society, c in SOCIETY_COORDS.items():
        if society in addr:
            coords = c
            break
    
    # If not found in societies, fallback to area-level
    if not coords:
        if "wakad" in city: coords = SOCIETY_COORDS["wakad"]
        elif "baner" in city: coords = SOCIETY_COORDS["baner"]
        elif "pimple saudagar" in city: coords = SOCIETY_COORDS["pimple saudagar"]
        elif "hinjewadi" in city: coords = SOCIETY_COORDS["eon homes"] # approximate center

    if coords:
        dist = haversine(target_lat, target_lng, coords[0], coords[1])
        results.append({
            'name': row['fullname'],
            'dist': dist,
            'addr': f"{row['address']}"
        })

results.sort(key=lambda x: x['dist'])

print("\nTop 7 Cooks near Melange Residences (Target: 18.5912, 73.7015):")
print("-" * 75)
print(f"{'#':<3} {'Name':<20} {'Distance':<12} {'Address'}")
print("-" * 75)
for i, r in enumerate(results[:10]):
    dist_str = f"{r['dist']:.2f} km"
    if r['dist'] == 0:
        # Show a very small offset if it's the same building
        dist_str = "Within Bldg"
    print(f"{i+1:<3} {r['name']:<20} {dist_str:<12} {r['addr']}")
