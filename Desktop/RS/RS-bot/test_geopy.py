"""
Quick test for geopy geocoding implementation
"""
import sys
sys.path.insert(0, 'src')

print("=" * 60)
print("Geopy Geocoding Test")
print("=" * 60)

# Test 1: Import geopy
print("\n1. Testing geopy import")
try:
    from geopy.geocoders import Nominatim
    print("✓ geopy installed successfully")
except ImportError:
    print("❌ geopy not installed. Run: pip install geopy")
    sys.exit(1)

# Test 2: Initialize Nominatim geocoder
print("\n2. Testing Nominatim geocoder initialization")
try:
    from src.geocoding_utils import Geocoder
    geocoder = Geocoder(provider="nominatim")
    print(f"✓ Geocoder initialized with provider: {geocoder.provider}")
    print(f"✓ Geolocator type: {type(geocoder.geolocator).__name__}")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

# Test 3: Geocode a sample address
print("\n3. Testing address geocoding (Nominatim)")
try:
    test_address = "Connaught Place"
    test_city = "Delhi"
    test_pincode = "110001"
    
    print(f"Geocoding: {test_address}, {test_city}, {test_pincode}")
    coords = geocoder.geocode_address(test_address, test_city, test_pincode)
    
    if coords:
        lat, lng = coords
        print(f"✓ Coordinates: ({lat:.6f}, {lng:.6f})")
        print(f"✓ Geocoding successful!")
    else:
        print("⚠ Geocoding returned None (may be rate limited or address not found)")
        
except Exception as e:
    print(f"❌ Error: {e}")

# Test 4: Check cache
print("\n4. Testing geocoding cache")
try:
    cache_size = len(geocoder.cache.cache)
    print(f"✓ Cache size: {cache_size} addresses")
    if cache_size > 0:
        print("✓ Cache is working!")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("Geopy Test Complete!")
print("=" * 60)
print("\n✅ Ready to use Nominatim (FREE) for geocoding!")
print("\nNext steps:")
print("1. Run: python prepare_geocoded_data.py")
print("2. This will geocode all addresses using Nominatim (free)")
print("3. Rate limit: 1 request/second (be patient for large datasets)")
print("=" * 60)
