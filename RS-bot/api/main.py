"""
FastAPI Backend for RozgarSetu
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional, List, Dict, Union, Any
import sys
import os
import httpx

# Load .env file if present (for GOOGLE_MAPS_API_KEY etc.)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv optional


# Add parent directory to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from src.recommender import RozgarSetuRecommender
from src.query_parser import QueryParser
from src.ids import normalize_entity_id

app = FastAPI(title="RozgarSetu API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
recommender = RozgarSetuRecommender()
query_parser = QueryParser()


def _first_worker_id(data_loader) -> Any:
    """First usable worker_id, or None if workers are missing or not loaded."""
    df = getattr(data_loader, "workers_df", None)
    if df is None or df.empty or "worker_id" not in df.columns:
        return None
    ids = df["worker_id"].dropna()
    if ids.empty:
        return None
    return ids.iloc[0]


class QueryRequest(BaseModel):
    query: str
    worker_id: Optional[Union[int, str]] = None


class RecommendationRequest(BaseModel):
    worker_id: Union[int, str]
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    wage_max: Optional[int] = None
    work_type: Optional[str] = None
    top_k: int = 5


class WorkersForJobRequest(BaseModel):
    query: Optional[Dict] = None
    top_k: int = 5


@app.get("/")
def root():
    return {"message": "RozgarSetu API - RAG-Enhanced Hybrid Recommender"}


@app.head("/")
def root_head():
    """UptimeRobot free tier uses HEAD; must return 200 with no body (not 405)."""
    return Response(status_code=200)


@app.post("/api/parse-query")
def parse_query(request: QueryRequest):
    """Parse natural language query"""
    try:
        parsed = query_parser.parse(request.query)
        return {
            "query": request.query,
            "parsed": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend")
def get_recommendations(request: RecommendationRequest):
    """Get job recommendations for a worker"""
    try:
        query = {
            'location': request.location,
            'skills': request.skills,
            'wage_max': request.wage_max,
            'work_type': request.work_type
        }

        matches = recommender.get_top_matches(
            worker_id=request.worker_id,
            query=query,
            top_k=request.top_k
        )

        return {
            "worker_id": request.worker_id,
            "matches": matches,
            "count": len(matches)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
def chat(request: QueryRequest):
    """Chat endpoint - parses query and returns recommendations"""
    try:
        # Parse query
        parsed = query_parser.parse(request.query)

        # If worker_id not provided, use first loaded worker (website sends null)
        if request.worker_id is not None:
            worker_id = request.worker_id
        else:
            worker_id = _first_worker_id(recommender.data_loader)
            if worker_id is None:
                return {
                    "query": request.query,
                    "parsed": parsed,
                    "response": (
                        "Worker data is not available. Add workers.csv (or load workers) "
                        "and restart the API."
                    ),
                    "matches": [],
                }

        # Get recommendations
        matches = recommender.get_top_matches(
            worker_id=worker_id,
            query=parsed,
            top_k=5
        )

        # Format response
        response_text = f"Found {len(matches)} results:\n\n"

        for i, match in enumerate(matches, 1):
            response_text += f"{i}. {match['title']}\n"
            response_text += f"   Location: {match['location']}\n"
            response_text += f"   Wage: Rs.{match['wage_range']}\n"
            response_text += f"   Match Score: {match['score']:.1%}\n"
            response_text += f"   {match['explanation']}\n\n"

        return {
            "query": request.query,
            "parsed": parsed,
            "response": response_text,
            "matches": matches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workers-for-job")
def get_workers_for_job(request: WorkersForJobRequest):
    """
    Find top workers matching a job query (used by the website chatbot widget).
    Accepts a pre-parsed query dict.
    """
    try:
        query = request.query or {}
        results = recommender.get_workers_for_job(
            query=query,
            top_k=request.top_k
        )
        matches = results.get("matches", [])
        target_coords = results.get("target_coords")
        tc_list = list(target_coords) if target_coords else None
        map_features = jsonable_encoder(
            recommender.get_map_features(query, matches, target_coords)
        )
        return {
            "matches": matches,
            "count": len(matches),
            "target_coords": tc_list,
            "map_features": map_features,
            "empty_reason": results.get("empty_reason"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bot")
def bot_chat(request: QueryRequest):
    """
    Full bot endpoint: parse NL query -> find matching workers -> return rich response.
    Single endpoint the website chat widget can use directly.
    """
    try:
        # 1. Parse query
        parsed = query_parser.parse(request.query)

        # 2. Find workers matching the job description
        results = recommender.get_workers_for_job(query=parsed, top_k=5)
        matches = results.get("matches", [])
        empty_reason = results.get("empty_reason")
        target_coords = results.get("target_coords")
        tc_list = list(target_coords) if target_coords else None
        map_features = jsonable_encoder(
            recommender.get_map_features(parsed, matches, target_coords)
        )

        # 3. Build a friendly text summary
        if matches:
            summary = f"Found {len(matches)} worker(s) near you:\n"
            for i, m in enumerate(matches, 1):
                dist = m.get('distance', '')
                dist_str = f" ({dist} away)" if dist and dist != "Unknown" else ""
                summary += (
                    f"{i}. {m['name']}{dist_str} — "
                    f"{', '.join(m.get('skills', []))}\n"
                )
        elif empty_reason == "no_skill_match":
            summary = (
                "No workers available with the requested skills for this search. "
                "Try a different skill or area."
            )
        elif empty_reason == "no_rating_match":
            summary = (
                "No workers available with a rating at or above your minimum for this search. "
                "Try lowering the rating requirement or broadening the location."
            )
        else:
            summary = (
                "Sorry, no workers found for your query. "
                "Try a different location or skill."
            )

        return {
            "query": request.query,
            "parsed": parsed,
            "response": summary,
            "matches": matches,
            "target_coords": tc_list,
            "map_features": map_features,
            "empty_reason": empty_reason,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/reload-workers")
def reload_workers():
    """
    Reload worker data live from the Node.js backend (MongoDB).
    Call this after new workers register — no bot restart needed.
    """
    try:
        ok = recommender.data_loader.load_workers_from_api()
        if ok:
            count = len(recommender.data_loader.workers_df)
            return {"success": True, "message": f"Reloaded {count} workers from backend API."}
        else:
            # Fallback info
            count = len(recommender.data_loader.workers_df) if recommender.data_loader.workers_df is not None else 0
            return {"success": False, "message": f"API unavailable. Still using {count} workers from CSV."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")


@app.get("/api/places-autocomplete")
async def places_autocomplete(input: str = Query(..., min_length=1)):
    """
    Proxy for Google Maps Places Autocomplete API.
    Returns up to 5 address suggestions for the input string.
    Restricted to India / Pune area via location bias.
    """
    if not GOOGLE_MAPS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GOOGLE_MAPS_API_KEY not set on server. Add it to your .env file."
        )
    url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    params = {
        "input": input,
        "key": GOOGLE_MAPS_API_KEY,
        "components": "country:in",            # restrict to India
        "location": "18.5936,73.7831",         # Pune / PCMC centre bias
        "radius": 50000,                       # 50 km radius bias
        "language": "en",
        "types": "geocode|establishment",
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            data = resp.json()
        predictions = data.get("predictions", [])
        return {
            "predictions": [
                {
                    "place_id": p["place_id"],
                    "description": p["description"],
                    "main_text": p.get("structured_formatting", {}).get("main_text", p["description"]),
                    "secondary_text": p.get("structured_formatting", {}).get("secondary_text", ""),
                }
                for p in predictions[:5]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Places API error: {e}")


@app.get("/api/geocode-place")
async def geocode_place(place_id: str = Query(...)):
    """
    Resolve a Google Places place_id to lat/lng coordinates.
    Used after the user selects an autocomplete suggestion.
    """
    if not GOOGLE_MAPS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GOOGLE_MAPS_API_KEY not set on server."
        )
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "key": GOOGLE_MAPS_API_KEY,
        "fields": "geometry,name,formatted_address",
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            data = resp.json()
        result = data.get("result", {})
        loc = result.get("geometry", {}).get("location", {})
        if not loc:
            raise HTTPException(status_code=404, detail="Place not found")
        return {
            "lat": loc["lat"],
            "lng": loc["lng"],
            "name": result.get("name", ""),
            "formatted_address": result.get("formatted_address", ""),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Place Details API error: {e}")


@app.get("/api/workers")
def get_workers():
    """Get all available workers"""
    try:
        workers_df = recommender.data_loader.get_all_workers()
        workers = []
        for _, row in workers_df.iterrows():
            workers.append(recommender.data_loader.get_worker(row["worker_id"]))
        return {"workers": workers, "count": len(workers)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs")
def get_jobs():
    """Get all open jobs"""
    try:
        jobs_df = recommender.data_loader.get_all_jobs()
        jobs = []
        for _, row in jobs_df.iterrows():
            jobs.append(recommender.data_loader.get_job(normalize_entity_id(row["job_id"])))
        return {"jobs": jobs, "count": len(jobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
