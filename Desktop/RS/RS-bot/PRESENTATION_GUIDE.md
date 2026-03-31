# 💼 RozgarSetu: Hyper-Local Job Matching Chatbot
## Presentation Guide & Project Overview

RozgarSetu is a next-generation job recommendation bot designed to bridge the gap between workers and employers in urban neighborhoods like Hinjewadi. It combines advanced AI matching with high-fidelity mapping to create a "Swiggy-like" experience for hiring local talent.

---

## 🌟 Key Features (The "WOW" Factors)

### 1. Interactive Neighborhood Map 📍
*   **Dynamic Pins**: Displays a **Red Pin (🎯)** for the user's targeted search location and **Blue Pins (👤)** for available workers.
*   **Proximity Visualization**: Automatically zooms to the relevant area (e.g., Hinjewadi Phase 1, 2, or 3) to show how close workers are to your exact landmark.
*   **Hover Tooltips**: Hover over any pin to see the worker's name and contact details instantly.

### 2. Premium Swiggy-Style UI 📱
*   **Vertical List Layout**: Worker profiles are displayed in clean cards with profile photos on the left and details on the right.
*   **Distance-First Display**: The most important information—**how far away they are**—is highlighted at the top of every card.

### 3. Smart "Hinglish" Query Parsing 🗣️
*   **Language Flexibility**: Understands queries like *"find cooks near TCS Circle"* or *"Hinjewadi ke pass maid chaiye"*.
*   **Landmark Awareness**: Specialized extraction for local societies and landmarks like *Melange Residences*, *Eon Homes*, *Wipro Circle*, and *Phoenix Mall*.

### 4. Precision Geocoding (Google Maps API) 🌐
*   **Global Search**: Integrated with the Google Maps API to find any office, mall, or society address in real-time.
*   **Automatic Fallback**: Includes a built-in fallback system to open-source maps (Nominatim) to ensure 24/7 reliability.

---

## ⚙️ How It Works (The Engine)

The recommendation engine uses a **3-Stage Hybrid Model** to ensure the best possible match:

1.  **Stage 1: Content-Based Filtering (CBF)**
    *   **Priority 1: Skill (70%)** - Ensures the worker actually knows the job.
    *   **Priority 2: Distance (20%)** - Prioritizes workers in the same society or street.
    *   **Priority 3: Experience (10%)** - Uses veteran status as a tie-breaker.

2.  **Stage 2: Collaborative Filtering (CF)**
    *   Analyzes past high-rating interactions to suggest workers that other employers in the neighborhood loved.

3.  **Stage 3: CHK-SVM Classifier**
    *   A Support Vector Machine (SVM) model that combines all features (match score, distance, rating) to pick the ultimate "Top 5" matches.

---

## 🛠️ Technology Stack
*   **Frontend**: Streamlit (Reactive Web Interface)
*   **Visualization**: PyDeck (High-performance mapping)
*   **Mapping**: Google Maps API & Geopy
*   **NLP**: Custom Query Parser with Hybrid Translation
*   **ML Engine**: Scikit-Learn (SVM Classifier, TF-IDF Vectorization)
*   **Data**: Pandas & CSV-based Local Storage

---

## 🚀 Live Demo Workflow (Recommended)
1.  **Open the App**: `streamlit run app.py`
2.  **The "Power Search"**: Type *"find cooks near Phoenix Mall of the Millennium Wakad"*
    *   Point out how the **Red Pin** drops exactly at the mall.
3.  **The "Local Society" Search**: Type *"maids at Melange Residences"*
    *   Point out how workers living in the same society show **0.0 km** distance.
4.  **The Profile**: Show the profile pictures and contact information on the worker cards.

---

**Developed for Advanced Agentic Coding - Prototype v2.0**
