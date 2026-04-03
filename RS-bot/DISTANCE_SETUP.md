# Distance-Based Matching Setup Guide

## Overview

The system now uses **real-time distance calculation** between addresses using **geopy** library with support for multiple geocoding providers.

## Quick Start (FREE - No API Key Needed!)

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs `geopy` which supports multiple geocoding providers.

### 2. Prepare Geocoded Data (One-time)

**Using Nominatim (FREE, no API key needed)**:
```bash
python prepare_geocoded_data.py --workers data/syn_workers.csv --jobs data/jobs.csv
```

This will:
- Use OpenStreetMap's Nominatim service (completely free)
- Geocode all unique addresses
- Cache coordinates in `data/geocoding_cache.json`
- Respect rate limit (1 request/second)

**Note**: For 3000+ addresses, this may take ~1 hour due to rate limiting.

### 3. Run the System

```bash
streamlit run app.py
```

The system will now use distance-based matching automatically!

## Geocoding Providers

### Nominatim (OpenStreetMap) - **RECOMMENDED**

✅ **Completely FREE**  
✅ **No API key required**  
✅ **No usage limits**  
⚠️ Rate limit: 1 request/second  
⚠️ Slower for large datasets

**Usage**:
```bash
python prepare_geocoded_data.py --provider nominatim
```

### Google Maps Geocoding API

✅ Most accurate  
✅ Faster (50 requests/second)  
⚠️ Requires API key  
⚠️ Paid after free tier (40,000 requests/month)

**Setup**:
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Geocoding API
3. Set environment variable:
   ```cmd
   set GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
4. Run with Google provider:
   ```bash
   python prepare_geocoded_data.py --provider google
   ```

## How It Works

### Address Structure

The system uses detailed addresses from `syn_workers.csv`:
- **address**: Street address (e.g., "17/52, Choudhry Marg")
- **city**: City name (e.g., "Mumbai", "Pune")
- **pincode**: Postal code

### Distance Calculation

1. **Geocoding**: Converts addresses to latitude/longitude using geopy
2. **Haversine Formula**: Calculates straight-line distance
3. **Distance Scoring**:
   - < 5 km: Perfect match (score = 1.0)
   - 5-10 km: Good match (score = 0.8-0.3)
   - 10-20 km: Fair match (score = 0.3-0.1)
   - > 20 km: Poor match (score < 0.1)

### Caching

- All geocoded coordinates are cached in `data/geocoding_cache.json`
- Once geocoded, never geocoded again
- Cache persists across sessions
- Works with any provider

## Updating Dataset

When you add new workers or jobs:

1. Add them to your CSV file
2. Run the geocoding script again:
   ```bash
   python prepare_geocoded_data.py
   ```
3. Only new addresses will be geocoded (cached ones are skipped)

## Switching Providers

You can switch between providers anytime:

```python
from src.recommender import RozgarSetuRecommender

# Use Nominatim (free)
recommender = RozgarSetuRecommender(
    provider="nominatim"
)

# Use Google Maps
recommender = RozgarSetuRecommender(
    provider="google",
    api_key="your_api_key"
)
```

## Troubleshooting

### "geopy not installed"
```bash
pip install geopy
```

### Geocoding is slow
- **Nominatim**: Rate limited to 1 request/second (normal)
- **Solution**: Be patient or switch to Google provider

### "Geocoding failed" errors
- Check internet connection
- Verify address format in CSV
- Try different provider

### Distance shows "Unknown"
- Address couldn't be geocoded
- Falls back to city-level matching
- Check address format

## Example Usage

```python
from src.recommender import RozgarSetuRecommender

# Initialize with Nominatim (free)
recommender = RozgarSetuRecommender(
    use_distance_based_location=True,
    provider="nominatim"
)

# Get recommendations (sorted by distance!)
matches = recommender.get_top_matches(worker_id=1, top_k=5)

for match in matches:
    print(f"{match['title']} - {match['distance']} away")
```

## Benefits

✅ **FREE Option**: Nominatim requires no API key  
✅ **Flexible**: Switch providers easily  
✅ **More Accurate**: Distance-based vs city-level  
✅ **Better UX**: Shows exact distance  
✅ **Scalable**: Caching minimizes API costs  
✅ **Reliable**: Falls back gracefully

## Comparison

| Feature | Nominatim | Google Maps |
|---------|-----------|-------------|
| Cost | FREE | 40k free/month |
| API Key | Not needed | Required |
| Speed | 1 req/sec | 50 req/sec |
| Accuracy | Good | Excellent |
| Best For | Budget-conscious | High-volume |

## Recommendation

**Start with Nominatim** (free, no setup). If you need faster geocoding for large datasets, upgrade to Google Maps later.
