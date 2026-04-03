"""
Distance calculation utilities
Implements Haversine formula for calculating distance between coordinates
"""
import math
from typing import Tuple, Optional


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth
    using the Haversine formula
    
    Args:
        lat1, lon1: Latitude and longitude of first point (in degrees)
        lat2, lon2: Latitude and longitude of second point (in degrees)
    
    Returns:
        Distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of Earth in kilometers
    r = 6371.0
    
    distance = r * c
    return distance


def distance_to_score(distance_km: float, max_distance: float = 50.0) -> float:
    """
    Convert distance in kilometers to a similarity score (0-1)
    
    Scoring formula:
    - < 5 km: 1.0 (perfect match)
    - 5-10 km: 0.8 to 0.3 (linear decay)
    - 10-20 km: 0.3 to 0.1 (slower decay)
    - > 20 km: 0.1 to 0.0 (very slow decay)
    
    Args:
        distance_km: Distance in kilometers
        max_distance: Maximum distance to consider (beyond this, score is 0)
    
    Returns:
        Similarity score between 0 and 1
    """
    if distance_km < 0:
        return 0.0
    
    if distance_km < 5:
        return 1.0
    elif distance_km < 10:
        # Linear decay from 1.0 to 0.3
        return 1.0 - (distance_km - 5) * 0.14
    elif distance_km < 20:
        # Slower decay from 0.3 to 0.1
        return 0.3 - (distance_km - 10) * 0.02
    elif distance_km < max_distance:
        # Very slow decay from 0.1 to 0.0
        return max(0.0, 0.1 - (distance_km - 20) * 0.003)
    else:
        return 0.0


def calculate_distance_and_score(
    coords1: Optional[Tuple[float, float]], 
    coords2: Optional[Tuple[float, float]],
    max_distance: float = 50.0
) -> Tuple[Optional[float], float]:
    """
    Calculate distance and similarity score between two coordinate pairs
    
    Args:
        coords1: Tuple of (latitude, longitude) for first location
        coords2: Tuple of (latitude, longitude) for second location
        max_distance: Maximum distance to consider
    
    Returns:
        Tuple of (distance_km, similarity_score)
        Returns (None, 0.0) if either coordinate is None
    """
    if coords1 is None or coords2 is None:
        return (None, 0.0)
    
    lat1, lon1 = coords1
    lat2, lon2 = coords2
    
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    score = distance_to_score(distance, max_distance)
    
    return (distance, score)


def format_distance(distance_km: Optional[float]) -> str:
    """
    Format distance for display
    
    Args:
        distance_km: Distance in kilometers
    
    Returns:
        Formatted string (e.g., "2.3 km", "450 m", "Unknown")
    """
    if distance_km is None:
        return "Unknown"
    
    if distance_km < 1:
        # Show in meters for distances less than 1 km
        meters = int(distance_km * 1000)
        return f"{meters} m"
    else:
        # Show in kilometers with 1 decimal place
        return f"{distance_km:.1f} km"


class DistanceCalculator:
    """
    Distance calculator with configurable parameters
    """
    
    def __init__(self, max_distance: float = 50.0):
        """
        Initialize distance calculator
        
        Args:
            max_distance: Maximum distance to consider (km)
        """
        self.max_distance = max_distance
    
    def calculate(
        self, 
        coords1: Optional[Tuple[float, float]], 
        coords2: Optional[Tuple[float, float]]
    ) -> Tuple[Optional[float], float]:
        """
        Calculate distance and score
        
        Args:
            coords1: First coordinate pair (lat, lng)
            coords2: Second coordinate pair (lat, lng)
        
        Returns:
            Tuple of (distance_km, similarity_score)
        """
        return calculate_distance_and_score(coords1, coords2, self.max_distance)
    
    def get_score(
        self, 
        coords1: Optional[Tuple[float, float]], 
        coords2: Optional[Tuple[float, float]]
    ) -> float:
        """
        Get similarity score only
        
        Args:
            coords1: First coordinate pair (lat, lng)
            coords2: Second coordinate pair (lat, lng)
        
        Returns:
            Similarity score (0-1)
        """
        _, score = self.calculate(coords1, coords2)
        return score
    
    def get_distance(
        self, 
        coords1: Optional[Tuple[float, float]], 
        coords2: Optional[Tuple[float, float]]
    ) -> Optional[float]:
        """
        Get distance only
        
        Args:
            coords1: First coordinate pair (lat, lng)
            coords2: Second coordinate pair (lat, lng)
        
        Returns:
            Distance in kilometers or None
        """
        distance, _ = self.calculate(coords1, coords2)
        return distance
