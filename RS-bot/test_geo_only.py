"""
Lightweight test - geocoder + query parser only (no data loading)
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

CACHE_FILE = "data/geocoding_cache.json"

# ── Step 1: Clean cache ───────────────────────────────────────────────────────
print("STEP 1: Cleaning stale cache entries")
with open(CACHE_FILE, "r", encoding="utf-8") as f:
    cache = json.load(f)
BAD_LATS = {18.5213738, 22.3511148}
new_cache = {k: v for k, v in cache.items() if v.get("lat") not in BAD_LATS}
removed = len(cache) - len(new_cache)
with open(CACHE_FILE, "w", encoding="utf-8") as f:
    json.dump(new_cache, f, indent=2, ensure_ascii=False)
print(f"  Removed {removed} stale, kept {len(new_cache)} entries")

# ── Step 2: Query Parser ──────────────────────────────────────────────────────
print("\nSTEP 2: Query Parser")
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
    r = parser.parse(q)
    print(f"  Q: {q}")
    print(f"     address={r['address']!r}  location={r['location']!r}  skills={r['skills']}")

# ── Step 3: Geocoder ──────────────────────────────────────────────────────────
print("\nSTEP 3: Geocoder (hardcoded table only, no API)")
from src.geocoding_utils import Geocoder
geo = Geocoder(provider="nominatim", cache_file=CACHE_FILE)

tests3 = [
    ("Priyadarshani School Bhosri", "Bhosri"),
    ("Bhosri", ""),
    ("TCS Circle", "Hinjewadi"),
    ("Melange Residences", "Hinjewadi"),
    ("Wakad", ""),
    ("Pimpri", ""),
]
for addr, city in tests3:
    coords = geo.geocode_address(addr, city)
    if coords:
        print(f"  '{addr}' + '{city}' -> lat={coords[0]:.4f}, lng={coords[1]:.4f}")
    else:
        print(f"  '{addr}' + '{city}' -> NONE (needs Nominatim API)")

# ── Step 4: Distance ──────────────────────────────────────────────────────────
print("\nSTEP 4: Distance calculation")
from src.distance_calculator import haversine_distance, format_distance

bhosri    = geo.geocode_address("Bhosri", "")
wakad     = geo.geocode_address("Wakad", "")
hinjewadi = geo.geocode_address("Hinjewadi", "")
pimpri    = geo.geocode_address("Pimpri", "")

pairs = [
    ("Bhosri", bhosri, "Wakad", wakad),
    ("Bhosri", bhosri, "Hinjewadi", hinjewadi),
    ("Bhosri", bhosri, "Pimpri", pimpri),
]
for n1, c1, n2, c2 in pairs:
    if c1 and c2:
        d = haversine_distance(c1[0], c1[1], c2[0], c2[1])
        print(f"  {n1} -> {n2}: {format_distance(d)}")

print("\nDONE")
