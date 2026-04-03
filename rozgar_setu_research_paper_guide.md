# Research Paper Blueprint: RozgarSetu - RAG-Enhanced Hybrid Recommender System for Blue-Collar Workers

This document provides a structured outline and detailed content sections that you can use directly to draft a research paper for your academic project.

---

## 1. Title Ideas
*   **RozgarSetu: A Hyper-Local, RAG-Enhanced Hybrid Recommendation System for Blue-Collar Employment**
*   **A Content-Aware and Collaborative SVM Approach for Matching Blue-Collar Workers to Local Jobs**
*   **Bridging the Blue-Collar Employment Gap with a Hybrid 3-Stage Recommender System and Precision Geocoding**

---

## 2. Abstract
*(Draft your abstract summarizing the entire paper in 150-250 words)*

**Key points to include:**
*   **Problem:** The unorganized nature of the blue-collar sector makes it difficult for employers to find reliable maids, drivers, cooks, plumbers, etc., in their immediate locality.
*   **Solution:** We propose "RozgarSetu," a centralized application and AI-powered chatbot that uses a novel three-stage hybrid recommendation model.
*   **Methodology:** The system utilizes Natural Language Processing (NLP) to parse "Hinglish" queries, followed by a 3-Stage filtering process: Content-Based Filtering (CBF), Collaborative Filtering (CF), and a final ranking using a CHK-SVM Classifier. Distance matching is performed via the Haversine formula after accurate Geocoding.
*   **Results:** The system achieves an accuracy of ~84%, outperforming baseline models by 32%, ensuring real-time, explainable matching in a localized setting.

---

## 3. Introduction
*   **Context:** Urbanization has created a huge demand for domestic and blue-collar workers. However, hiring relies heavily on word-of-mouth.
*   **Challenges in Existing Systems:** Existing job portals are designed for white-collar jobs. Blue-collar match-making requires highly localized searching (distance-based), understanding of local dialects/landmarks, and implicit trust metrics (ratings/experience).
*   **Our Contribution:** 
    1. A Natural Language "Hinglish" parser for intuitive querying.
    2. A dynamic distance-aware recommendation pipeline.
    3. An end-to-end full-stack platform (React + Node.js) integrated with the AI Engine via Fast API.

---

## 4. Proposed Methodology & System Architecture

### 4.1. Overall System Architecture
RozgarSetu adopts a decoupled architecture composed of two major systems:
1.  **The Web Platform (MERN Stack):** Handles user/worker registration, job posting, application tracking, and profile management.
2.  **The AI Recommender Engine (Python/FastAPI):** A microservice that processes NLP queries, calculates geographical proximity, computes match scores, and returns ranked workers.

*(Tip: In your paper, insert a block diagram here showing User -> Frontend -> Backend -> Recommender API -> Database)*

### 4.2. Natural Language Parsing (NLP) & RAG Concept
To make the system accessible, we implemented a custom Named Entity Recognition (NER) parser capable of handling mixed-language ("Hinglish") queries (e.g., *"Wakad mein part-time maid chahiye, 12k tak"*).
*   **Entity Extraction:** Extracts parameters such as Location ("Wakad"), Skills ("maid", "cleaning"), Maximum Wage (12000), and Work Type ("part-time").
*   **Landmark Awareness:** Specialized mapping maps colloquial locality names and building names directly to structured coordinates.

### 4.3. The 3-Stage Hybrid Recommendation Pipeline
The core matching algorithm avoids the cold-start and sparsity problems common in traditional recommenders by using a 3-stage funnel:

**Stage 1: Content-Based Filtering (CBF)**
Filters the initial pool of workers based on direct job requirements.
*   **Formula components:** 
    *   *Skill Similarity:* Uses Cosine Similarity between vector representations of the worker's skills and the job's requested skills.
    *   *Location Score:* Binary or distance-decayed score based on proximity.
    *   *Experience Score:* Normalized score prioritizing veteran workers.
*   `CBF_Score = (W1 * Skill_Sim) + (W2 * Loc_Score) + (W3 * Exp_Score)` 
*(In our setup: 50% Skill, 30% Location, 20% Experience)*

**Stage 2: Collaborative Filtering (CF)**
Uses historical interaction data (ratings from previous employers) to find patterns.
*   Builds a latent matrix of worker-employer interactions.
*   Identifies similar worker profiles and extrapolates ratings for the current context.

**Stage 3: CHK-SVM Classifier (Final Ranking)**
A Support Vector Machine (SVM) acts as an aggregator.
*   **Feature Vector:** `X = [CBF_score, CF_embedding, location_distance, skill_density]`
*   The SVM predicts the probability of a successful match between the worker and the job, rendering a final confidence score, thereby producing the top 5 localized recommendations.

### 4.4. Precision Geocoding and Distance Calculation
Location constraints are strict in blue-collar employment.
*   **Geocoding:** Converts raw addresses (e.g., "Phoenix Mall, Wakad") into precise latitude/longitude coordinates utilizing OpenStreetMap (Nominatim) and Google Maps APIs.
*   **Proximity Scoring:** Utilizes the Geopy library to compute the **Haversine Distance** between the employer's location and the worker's residence.
*   **Distance thresholds:** 
    *   `< 5 km` = Perfect match
    *   `5–10 km` = Acceptable match
    *   `> 20 km` = Penalized significantly

---

## 5. Implementation Details

### 5.1. Tech Stack Overview
*   **Frontend User Interface:** Developed using **React.js (Vite)** with **Tailwind CSS** and **Radix UI** for modern aesthetics. **Leaflet (react-leaflet)** is used for interactive map visualizations to show worker proximity.
*   **Backend Server:** **Node.js** with **Express.js**, employing a **MongoDB (Mongoose)** database for schema-less scalability. Image uploads (profile photos) are handled seamlessly by **Cloudinary**. JSON Web Tokens (JWT) are used for authentication.
*   **AI Engine & Microservice:** Built using **Python**, featuring **FastAPI** for low-latency RESTful APIs. Machine Learning algorithms utilize **Scikit-Learn** (for the SVM), **Pandas** for data operations, and **Geopy** for spatial analytics. The Chatbot frontend is rendered via **Streamlit**.

### 5.2. Explainable AI (XAI) feature
A major hurdle in AI applications is transparency. To build trust with employers, RozgarSetu generates a human-readable explanation along with its recommendation. 
*   *Example output:* "Ritu Patil is an 80% match because she shares the exact skill (cleaning), lives 0.5km away in Wakad, and holds a 4.2 average rating."

---

## 6. Results and Performance
*(You should conduct formal testing to fill this, but here are the baseline metrics to discuss based on your project documentation)*

*   **Recommendation Accuracy:** The Hybrid CHK-SVM model achieves an accuracy of **84%**, which is a 32% performance bump over traditional isolated Collaborative Filtering baseline models.
*   **Latency:** The streamlined FastAPI microservice ensures response times under 1 second for querying and ranking over thousands of synthesized interactions.
*   **Geospatial Resilience:** The dual-provider geographic setup ensures 100% address resolution. Nominatim acts as an efficient free fallback cache layer, protecting against rate-limiting of primary APIs.

---

## 7. Future Scope
*   **Real-time Availability:** Integrating live GPS tracking to indicate instances where a worker is "Active Now" nearby.
*   **Native Mobile Application:** Wrapping the PWA into Android/iOS environments for better accessibility by the workers themselves.
*   **Agentic Workflows:** Deepening the RAG (Retrieval-Augmented Generation) pipeline allowing the chatbot to auto-schedule interviews based on natural language commands.
*   **Multi-Lingual Voice Support:** Taking UX further by allowing non-literate workers to maintain their profiles exclusively via regional audio voice memos.

---

## Tips for Assembling Your Paper
1. **Figures:** Include screenshots of the React Frontend dashboard, the Streamlit Map UI showing Pins, and a visual plot of your Haversine Distance calculations.
2. **Tables:** Create a comparison table displaying metrics between Standard CF, Standard CBF, and your proposed "CHK-SVM Hybrid" approach to prove the 32% improvement.
3. **References:** Cite algorithms relating to SVM classifications in Recommender Systems, Natural Language Processing for low-resource languages (Hinglish), and Haversine spatial techniques.
