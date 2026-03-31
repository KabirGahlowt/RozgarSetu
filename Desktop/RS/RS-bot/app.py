"""
Streamlit Chatbot Frontend for RozgarSetu
"""
import os
import sys

import pandas as pd
import streamlit as st

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_loader import DataLoader
from src.query_parser import QueryParser
from src.recommender import RozgarSetuRecommender

# Page config
st.set_page_config(
    page_title="RozgarSetu - Job Matching Chatbot",
    page_icon="💼",
    layout="wide"
)

# Load config for API keys — prefer env var, fall back to config.json
def load_config():
    config_path = os.path.join("data", "config.json")
    if os.path.exists(config_path):
        import json
        with open(config_path, "r") as f:
            return json.load(f)
    return {}

config = load_config()
# Prefer env var; config.json is a secondary fallback
api_key = os.getenv("GOOGLE_MAPS_API_KEY") or config.get("google_api_key")
if not api_key or api_key in ("YOUR_API_KEY_HERE", "FROM_ENV", ""):
    api_key = None


# Initialize session state
if 'recommender' not in st.session_state or st.session_state.get('active_api_key') != api_key:
    # 1. Initialize Recommender with current key
    st.session_state.recommender = RozgarSetuRecommender(
        provider="google" if api_key else "nominatim",
        api_key=api_key
    )
    st.session_state.active_api_key = api_key
    
    # 2. Point app's data_loader to the recommender's instance
    st.session_state.data_loader = st.session_state.recommender.data_loader
    
    # 3. FORCE load test_addresses.csv into the active data_loader
    st.session_state.data_loader.load_data(
        workers_file="data/test_addresses.csv",
        jobs_file="data/jobs.csv"
    )
    
    st.session_state.query_parser = QueryParser()
    st.session_state.messages = []
    st.session_state.data_uploaded = False
    st.session_state.workers_uploaded = False
    st.session_state.find_workers_messages = [] # For the new UI structure

# Title
st.title("💼 RozgarSetu")
st.markdown("Prototype")
st.markdown("---")

# Sidebar for information
with st.sidebar:
    st.header("📍 Hinjewadi Prototype")
    st.info("Currently searching across local societies: Melange, Eon Homes, Kohinoor Coral, and more.")
    
    st.markdown("---")
    st.markdown("### Example Queries:")
    st.code("Find cooks near Melange Residences")
    st.code("Maid at Eon Homes")
    st.code("Part-time driver near Kohinoor Coral")

# Ensure recommender is initialized and synced with the correct data
if st.session_state.recommender is None:
    with st.spinner("Initializing matching engine..."):
        st.session_state.recommender = RozgarSetuRecommender()
        # Crucial: Sync the data loader which has our test_addresses loaded
        st.session_state.recommender.data_loader = st.session_state.data_loader
        st.session_state.recommender._load_jobs_cache()
        # Re-sync CF with the correct interactions
        st.session_state.recommender.cf.update_interactions(st.session_state.data_loader.get_interactions())

st.markdown("---")

# Initialize message history
if 'find_workers_messages' not in st.session_state:
    st.session_state.find_workers_messages = []

# FIND WORKERS SECTION
st.header("💬 Find Workers for Job")

# Display chat history
for message in st.session_state.find_workers_messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input (always at bottom)
if prompt := st.chat_input("Describe job requirements...", key="find_workers_input"):
    # Add user message
    st.session_state.find_workers_messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Process query
    with st.chat_message("assistant"):
        with st.spinner("Processing query and finding workers..."):
            try:
                # Parse query
                parsed = st.session_state.query_parser.parse(prompt)
                
                # Get worker matches
                results = st.session_state.recommender.get_workers_for_job(
                    query=parsed,
                    top_k=5
                )
                matches = results['matches']
                target_coords = results['target_coords']
                
                # Format response
                if matches:
                    st.markdown(f"Found **{len(matches)} workers** matches:")
                    assistant_response = ""
                    
                    # 1. RENDER WORKER CARDS FIRST
                    for i, match in enumerate(matches, 1):
                        with st.container():
                            col1, col2 = st.columns([1, 4])
                            with col1:
                                photo_url = match.get('profile_photo', 'https://via.placeholder.com/150')
                                st.image(photo_url, width='stretch')
                            
                            with col2:
                                st.markdown(f"### {i}. {match['name']}")
                                st.markdown(f"**Phone:** {match['phone']}")
                                dist = match.get('distance', '')
                                dist_str = f"📍 **{dist} away**" if dist and dist != "Unknown" else "📍 Distance Unknown"
                                st.markdown(dist_str)
                                
                                st.markdown(f"**Skills:** {', '.join(match['skills'])}")
                                st.markdown(f"**Experience:** {match['experience_years']} years | **Location:** {match['location']}")
                                
                                if match.get('address'):
                                    st.markdown(f"**Address:** {match['address']}")
                        
                        assistant_response += f"{i}. {match['name']} ({match.get('distance', 'Unknown')} away)\n"
                        st.markdown("---")
                    
                    # 2. RENDER MAP BELOW CARDS
                    st.subheader("📍 Neighborhood Map")
                    try:
                        import pydeck as pdk
                        worker_data = []
                        target_data = []
                        
                        # 2a. Search Target (User's Location)
                        # Use coordinates returned directly from the recommender for consistency
                        if target_coords:
                            # Prefer 'address' (the landmark after near) for the label
                            target_label = parsed.get('address') or parsed.get('location') or "Search Center"
                            target_data.append({
                                'lat': target_coords[0],
                                'lon': target_coords[1],
                                'label': f"🎯 YOU ARE HERE ({target_label})",
                                'type': 'target'
                            })

                        # 2b. Worker Locations
                        for m in matches:
                            worker_profile = st.session_state.data_loader.get_worker(m['worker_id'])
                            w_coords = st.session_state.recommender.cbf._get_coordinates(worker_profile)
                            if w_coords:
                                worker_data.append({
                                    'lat': w_coords[0],
                                    'lon': w_coords[1],
                                    'label': f"{m['name']} ({m['phone']})",
                                    'type': 'worker'
                                })
                        
                        if target_data or worker_data:
                            # User Location Layer
                            target_layer = pdk.Layer(
                                "ScatterplotLayer",
                                pd.DataFrame(target_data) if target_data else pd.DataFrame(columns=['lat', 'lon']),
                                get_position="[lon, lat]",
                                get_color="[255, 75, 75, 200]", # Bright Red
                                get_radius=120,
                                pickable=True
                            )
                            
                            target_text_layer = pdk.Layer(
                                "TextLayer",
                                pd.DataFrame(target_data) if target_data else pd.DataFrame(columns=['lat', 'lon', 'label']),
                                get_position="[lon, lat]",
                                get_text="label",
                                get_color="[255, 75, 75, 255]",
                                get_size=20,
                                get_alignment_baseline="'bottom'",
                            )

                            # Worker Layer
                            worker_layer = pdk.Layer(
                                "ScatterplotLayer",
                                pd.DataFrame(worker_data) if worker_data else pd.DataFrame(columns=['lat', 'lon']),
                                get_position="[lon, lat]",
                                get_color="[0, 100, 255, 180]", # Blue
                                get_radius=60,
                                pickable=True
                            )
                            
                            worker_text_layer = pdk.Layer(
                                "TextLayer",
                                pd.DataFrame(worker_data) if worker_data else pd.DataFrame(columns=['lat', 'lon', 'label']),
                                get_position="[lon, lat]",
                                get_text="label",
                                get_color="[0, 100, 255, 255]",
                                get_size=16,
                                get_alignment_baseline="'bottom'",
                            )

                            # Set initial view state to center on user or workers
                            all_pts = pd.DataFrame(target_data + worker_data)
                            view_state = pdk.ViewState(
                                latitude=all_pts['lat'].mean(),
                                longitude=all_pts['lon'].mean(),
                                zoom=14.5,
                                pitch=0
                            )

                            st.pydeck_chart(pdk.Deck(
                                layers=[target_layer, target_text_layer, worker_layer, worker_text_layer],
                                initial_view_state=view_state,
                                map_style=None
                            ))
                            st.caption("🎯 Red Pin = Your Search Location | Blue Pins = Workers Found")
                    except Exception as map_err:
                        if "509" in str(map_err):
                            st.warning("📍 The mapping service is temporarily busy (Rate Limit). Searching by area instead.")
                        else:
                            st.info(f"Map rendering: {map_err}")
                        
                        # Prepare map_data for st.map fallback
                        map_data = []
                        if target_data:
                            map_data.extend([{'lat': d['lat'], 'lon': d['lon']} for d in target_data])
                        if worker_data:
                            map_data.extend([{'lat': d['lat'], 'lon': d['lon']} for d in worker_data])
                        
                        st.map(pd.DataFrame(map_data) if map_data else None) # Fallback

                    # Debug info
                    with st.expander("Show Technical Details"):
                         st.json(parsed)
                    
                    st.session_state.find_workers_messages.append({"role": "assistant", "content": f"Found {len(matches)} matches. " + assistant_response})
                    
                else:
                    response = "Sorry, no workers found. Please try a different query."
                    st.markdown(response)
                    st.session_state.find_workers_messages.append({"role": "assistant", "content": response})
                
            except Exception as e:
                error_msg = f"Error: {str(e)}"
                st.error(error_msg)
                st.session_state.find_workers_messages.append({"role": "assistant", "content": error_msg})

# Footer
st.markdown("---")
# st.markdown("**RozgarSetu** ")
