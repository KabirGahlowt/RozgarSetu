"""
Quick test to verify:
1. Cache cleanup (remove stale wrong entries)
2. Query parser extracts address + location correctly
3. Geocoder returns correct Bhosri coords via hardcoded table
4. Distance calculation is real
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── Step 1: Clean cache ───────────────────────────────────────────────────────
print("=" * 60)
print("STEP 1: Cleaning stale cache entries")
print("=" * 60)
CACHE_FILE = "data/geocoding_cache.json"
with open(CACHE_FILE, "r", encoding="utf-8") as f:
    cache = json.load(f)

BAD_LATS = {18.5213738, 22.3511148}
original_count = len(cache)
new_cache = {k: v for k, v in cache.items() if v.get("lat") not in BAD_LATS}
removed = original_count - len(new_cache)

with open(CACHE_FILE, "w", encoding="utf-8") as f:
    json.dump(new_cache, f, indent=2, ensure_ascii=False)
print(f"  Removed {removed} stale entries (generic Pune/India center coords)")
print(f"  Remaining good entries: {len(new_cache)}")

# ── Step 2: Query Parser ──────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 2: Query Parser test")
print("=" * 60)
from src.query_parser import QueryParser
parser = QueryParser()

tests = [
    "Find cooks near Priyadarshani School Bhosri",
    "maid near Phoenix Mall Wakad",
    "driver near TCS Circle Hinjewadi",
    "plumber near Melange Residences",
    "cook near Pimpri railway station",
]

for q in tests:
    result = parser.parse(q)
    print(f"\n  Query  : {q}")
    print(f"  Address: {result['address']}")
    print(f"  Location: {result['location']}")
    print(f"  Skills : {result['skills']}")

# ── Step 3: Geocoder ──────────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 3: Geocoder test (Bhosri)")
print("=" * 60)
from src.geocoding_utils import Geocoder
geo = Geocoder(provider="nominatim", cache_file=CACHE_FILE)

geocode_tests = [
    ("Priyadarshani School Bhosri", "Bhosri"),
    ("Bhosri", ""),
    ("TCS Circle", "Hinjewadi"),
    ("Melange Residences", "Hinjewadi"),
    ("Phoenix Mall", "Wakad"),
]

for addr, city in geocode_tests:
    coords = geo.geocode_address(addr, city)
    print(f"\n  Address: '{addr}', City: '{city}'")
    if coords:
        print(f"  → Coords: lat={coords[0]:.4f}, lng={coords[1]:.4f}")
    else:
        print(f"  → FAILED (None)")

# ── Step 4: Distance from Bhosri to a Wakad worker ───────────────────────────
print()
print("=" * 60)
print("STEP 4: Distance Calculation")
print("=" * 60)
from src.distance_calculator import haversine_distance, format_distance

bhosri = geo.geocode_address("Bhosri", "")
wakad  = geo.geocode_address("Wakad", "")
hinjewadi = geo.geocode_address("Hinjewadi", "")

if bhosri and wakad:
    d = haversine_distance(bhosri[0], bhosri[1], wakad[0], wakad[1])
    print(f"  Bhosri → Wakad   : {format_distance(d)} (expected ~10-12 km)")
if bhosri and hinjewadi:
    d = haversine_distance(bhosri[0], bhosri[1], hinjewadi[0], hinjewadi[1])
    print(f"  Bhosri → Hinjewadi: {format_distance(d)} (expected ~12-15 km)")

print()
print("=" * 60)
print("ALL TESTS DONE")
print("=" * 60)
