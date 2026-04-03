"""
Geocoding utilities for address-to-coordinates conversion
Uses geopy library with support for multiple providers (Nominatim, Google, Bing, etc.)
"""
import os
import json
import time
from typing import Tuple, Optional, Dict, List
from pathlib import Path

try:
    from geopy.geocoders import Nominatim, GoogleV3
    from geopy.exc import GeocoderTimedOut, GeocoderServiceError
except ImportError:
    print("Warning: geopy not installed. Run: pip install geopy")
    Nominatim = None
    GoogleV3 = None
    GeocoderTimedOut = Exception
    GeocoderServiceError = Exception


class GeocodingCache:
    """Simple JSON-based cache for geocoded addresses"""
    
    def __init__(self, cache_file: str = "data/geocoding_cache.json"):
        self.cache_file = cache_file
        self.cache = self._load_cache()
    
    def _load_cache(self) -> Dict:
        """Load cache from file"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: Could not load cache: {e}")
                return {}
        return {}
    
    def save_cache(self):
        """Save cache to file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Warning: Could not save cache: {e}")
    
    def get(self, address: str) -> Optional[Tuple[float, float]]:
        """Get coordinates from cache"""
        normalized_address = address.lower().strip()
        if normalized_address in self.cache:
            coords = self.cache[normalized_address]
            return (coords['lat'], coords['lng'])
        return None
    
    def set(self, address: str, lat: float, lng: float):
        """Store coordinates in cache"""
        normalized_address = address.lower().strip()
        self.cache[normalized_address] = {'lat': lat, 'lng': lng}
        self.save_cache()


class Geocoder:
    """Geocoding service using geopy with multiple provider support"""
    
    def __init__(self, provider: str = "nominatim", api_key: Optional[str] = None, 
                 cache_file: str = "data/geocoding_cache.json", user_agent: str = "rozgarsetu_app"):
        """
        Initialize geocoder with geopy
        
        Args:
            provider: Geocoding provider ('nominatim', 'google', 'bing')
            api_key: API key for paid providers (Google, Bing)
            cache_file: Path to cache file
            user_agent: User agent for Nominatim (required)
        """
        self.provider = provider.lower()
        self.api_key = api_key or os.getenv('GOOGLE_MAPS_API_KEY')
        self.cache = GeocodingCache(cache_file)
        self.request_count = 0
        self.last_request_time = 0
        self.user_agent = user_agent
        
        # Precise Coordinates for Pune/PCMC landmarks and areas
        self.HARDCODED_SOCIETIES = {
            # Hinjewadi societies
            "melange residences": (18.5912, 73.7015),
            "eon homes": (18.5834, 73.6985),
            "megapolis": (18.5772, 73.6885),
            "kohinoor coral": (18.5825, 73.7124),
            "vedanta": (18.5986, 73.7651),
            "livmo": (18.5885, 73.7050),
            "saffron": (18.5860, 73.7030),
            "sunway": (18.5750, 73.6900),
            "splendour": (18.5840, 73.6995),
            "hinjewadi phase 3": (18.5912, 73.7015),
            "hinjewadi phase 2": (18.5872, 73.7045),
            "hinjewadi phase 1": (18.5920, 73.7200),
            "tcs circle": (18.5891, 73.6961),
            "tcs circle hinjewadi": (18.5891, 73.6961),
            # Pimple localities (frequently searched)
            "pimple saudagar": (18.6024, 73.7680),
            "pimple nilakh": (18.6076, 73.7714),
            "pimple gurav": (18.5932, 73.7905),
            "pimple saudagar pmc": (18.6024, 73.7680),
            # Elastic Run / logistics hubs
            "elastic run": (18.6024, 73.7680),      # Pimple Saudagar area
            "elastic run pimple saudagar": (18.6024, 73.7680),
            # PCMC areas — accurate coords
            "bhosri": (18.6215, 73.8644),
            "pimpri": (18.6278, 73.7963),
            "chinchwad": (18.6138, 73.8028),
            "nigdi": (18.6488, 73.7785),
            "akurdi": (18.6506, 73.7655),
            "dighi": (18.6128, 73.8841),
            "chakan": (18.7601, 73.8627),
            "moshi": (18.6686, 73.8398),
            "talawade": (18.6628, 73.7476),
            "dehu road": (18.7143, 73.7417),
            "alandi": (18.6703, 73.8975),
            "vishrantwadi": (18.5903, 73.8879),
            "pradhikaran nigdi": (18.6478, 73.8048),
            "pcmc": (18.6279, 73.8008),
            # Pune areas
            "wakad": (18.6022, 73.7644),
            "hinjewadi": (18.5920, 73.7576),
            "baner": (18.5642, 73.7769),
            "aundh": (18.5618, 73.8101),
            "kothrud": (18.5071, 73.8050),
            "hadapsar": (18.5007, 73.9379),
            "viman nagar": (18.5703, 73.9133),
            "kharadi": (18.5517, 73.9413),
            "wagholi": (18.5766, 73.9808),
            "kalyani nagar": (18.5455, 73.9022),
            "koregaon park": (18.5362, 73.8929),
            "magarpatta": (18.5163, 73.9281),
            "balewadi": (18.5756, 73.7754),
            "pashan": (18.5343, 73.8070),
            "shivajinagar": (18.5325, 73.8513),
            "kondhwa": (18.4679, 73.9005),
            "undri": (18.4713, 73.9101),
            "katraj": (18.4552, 73.8568),
            "warje": (18.4908, 73.8070),
            "bavdhan": (18.5231, 73.7824),
            "sangvi": (18.5720, 73.8075),
            "ravet": (18.6372, 73.7323),
            "tathawade": (18.6219, 73.7378),
            "punawale": (18.6313, 73.7460),
            "pradhikaran": (18.6478, 73.8048),
            "kasarwadi": (18.5949, 73.8149),
            "dapodi": (18.5793, 73.8292),
            "sus": (18.5433, 73.7603),
            "erandwane": (18.5134, 73.8340),
            "karve nagar": (18.4972, 73.8209),
            "narhe": (18.4679, 73.8355),
            "ambegaon": (18.4538, 73.8524),
            "dhayari": (18.4637, 73.8215),
            "wanowrie": (18.4981, 73.9022),
            "yerawada": (18.5406, 73.8893),
            "camp": (18.5189, 73.8727),
            "deccan": (18.5176, 73.8470),
            "swargate": (18.5027, 73.8566),
            "market yard": (18.5002, 73.8629),
        }
        
        # Initialize geocoder based on provider
        self.geolocator = self._init_geolocator()
        
        if self.geolocator is None:
            print(f"Warning: Could not initialize {provider} geocoder")
    
    def _init_geolocator(self):
        """Initialize the appropriate geopy geocoder"""
        if Nominatim is None:
            print("Error: geopy not installed. Run: pip install geopy")
            return None
        
        try:
            if self.provider == "nominatim":
                # Nominatim (OpenStreetMap) - Free, no API key needed
                return Nominatim(user_agent=self.user_agent)
            
            elif self.provider == "google":
                # Google Maps - Requires API key
                if not self.api_key:
                    print("Warning: Google provider requires API key. Falling back to Nominatim.")
                    return Nominatim(user_agent=self.user_agent)
                return GoogleV3(api_key=self.api_key)
            
            else:
                print(f"Unknown provider '{self.provider}'. Using Nominatim.")
                return Nominatim(user_agent=self.user_agent)
                
        except Exception as e:
            print(f"Error initializing geocoder: {e}")
            return None
    
    def _rate_limit(self):
        """Rate limiting based on provider"""
        if self.provider == "nominatim":
            # Nominatim requires 1 second between requests
            min_interval = 1.0
        else:
            # Other providers are more lenient
            min_interval = 0.1
        
        elapsed = time.time() - self.last_request_time
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
        self.last_request_time = time.time()
    
    def geocode_address(self, address: str, city: str = "", pincode: str = "") -> Optional[Tuple[float, float]]:
        """
        Convert address to latitude/longitude coordinates.
        
        Args:
            address: Street address or landmark (may already include the area/city)
            city: City/area name — only appended if NOT already part of the address
            pincode: Postal code
            
        Returns:
            Tuple of (latitude, longitude) or None if geocoding fails
        """
        address = (address or "").strip()
        city = (city or "").strip()
        
        # Check hardcoded coords first (exact and partial match)
        addr_lower = address.lower().strip()
        # 1. Full address substring match
        for society, coords in self.HARDCODED_SOCIETIES.items():
            if society in addr_lower:
                return coords
        # 2. Check city alone
        if city:
            city_lower = city.lower()
            for society, coords in self.HARDCODED_SOCIETIES.items():
                if city_lower == society:
                    if not address or address.lower() == city_lower:
                        return coords
        # 3. Progressive word-stripping fallback:
        #    "Elastic Run Pimple Saudagar" → try "run pimple saudagar",
        #    "pimple saudagar" → ✅ match!
        words = addr_lower.split()
        for start in range(1, len(words)):
            partial = " ".join(words[start:])
            for society, coords in self.HARDCODED_SOCIETIES.items():
                if partial == society or partial.startswith(society) or society in partial:
                    return coords
        # 4. Combined address+city progressive fallback
        if city:
            combined = f"{addr_lower} {city.lower()}".strip()
            for society, coords in self.HARDCODED_SOCIETIES.items():
                if society in combined:
                    return coords
        
        # Build the full geocoding query
        # Avoid appending city if it's already embedded in the address
        full_address_parts = [address]
        if city and city.lower() not in addr_lower:
            full_address_parts.append(city)
        if pincode:
            full_address_parts.append(str(pincode))
        full_address_parts.append("India")
        full_address = ", ".join(p for p in full_address_parts if p)
        
        # Check cache
        cached = self.cache.get(full_address)
        if cached:
            return cached
        
        # If no geolocator, return None
        if self.geolocator is None:
            return None
        
        # Geocode using geopy
        try:
            self._rate_limit()
            location = self.geolocator.geocode(full_address, timeout=10)
            self.request_count += 1
            
            if location:
                lat, lng = location.latitude, location.longitude
                self.cache.set(full_address, lat, lng)
                return (lat, lng)
            else:
                # Fallback 1: Try just the landmark with "India" (no city)
                fallback1 = f"{address}, India"
                print(f"Full address failed, trying: '{fallback1}'")
                self._rate_limit()
                location = self.geolocator.geocode(fallback1, timeout=10)
                
                if not location and city:
                    # Fallback 2: Try city + India only  
                    fallback2 = f"{city}, India"
                    print(f"Landmark failed, trying area: '{fallback2}'")
                    self._rate_limit()
                    location = self.geolocator.geocode(fallback2, timeout=10)
                
                if not location and " " in address:
                    # Fallback 3: Try first 3 words of address
                    short_addr = " ".join(address.split()[:3])
                    fallback3 = f"{short_addr}, India"
                    print(f"Trying shorter fallback: '{fallback3}'")
                    self._rate_limit()
                    location = self.geolocator.geocode(fallback3, timeout=10)
                
                if location:
                    lat, lng = location.latitude, location.longitude
                    self.cache.set(full_address, lat, lng)
                    return (lat, lng)
                
                print(f"Geocoding failed for '{full_address}': No results")
                return None
                    
        except GeocoderTimedOut:
            print(f"Geocoding timed out for '{full_address}'")
            return None
        except GeocoderServiceError as e:
            print(f"Geocoder service error for '{full_address}': {e}")
            return None
        except Exception as e:
            if "509" in str(e):
                print(f"Rate limit hit (509) for '{full_address}'. Using area fallback if possible.")
            else:
                print(f"Unexpected error geocoding '{full_address}': {e}")
            return None
    
    def batch_geocode(self, addresses: list, progress_callback=None) -> Dict[str, Optional[Tuple[float, float]]]:
        """
        Geocode multiple addresses
        
        Args:
            addresses: List of tuples (address, city, pincode)
            progress_callback: Optional callback function(current, total)
            
        Returns:
            Dictionary mapping full address to coordinates
        """
        results = {}
        total = len(addresses)
        
        for i, (address, city, pincode) in enumerate(addresses):
            full_address = f"{address}, {city}, {pincode}, India"
            coords = self.geocode_address(address, city, pincode)
            results[full_address] = coords
            
            if progress_callback:
                progress_callback(i + 1, total)
            
            # Print progress every 100 addresses
            if (i + 1) % 100 == 0:
                print(f"Geocoded {i + 1}/{total} addresses...")
        
        print(f"Batch geocoding complete. API requests made: {self.request_count}")
        return results
    
    def get_coordinates(self, address: str, city: str = "", pincode: str = "") -> Optional[Tuple[float, float]]:
        """
        Get coordinates for an address (alias for geocode_address)
        
        Args:
            address: Street address
            city: City name
            pincode: Postal code
            
        Returns:
            Tuple of (latitude, longitude) or None if geocoding fails
        """
        return self.geocode_address(address, city, pincode)


# Singleton instance for easy access
_geocoder_instance = None

def get_geocoder(provider: str = "nominatim", api_key: Optional[str] = None) -> Geocoder:
    """
    Get or create geocoder singleton instance
    
    Args:
        provider: Geocoding provider ('nominatim', 'google')
        api_key: API key for paid providers
    
    Returns:
        Geocoder instance
    """
    global _geocoder_instance
    if _geocoder_instance is None:
        _geocoder_instance = Geocoder(provider, api_key)
    return _geocoder_instance
