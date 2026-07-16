# Apogee Setup & API Documentation

This document describes the environment variables, API endpoints, setup steps, and guidelines for model training for the Apogee application.

---

## 1. Setup Instructions

### Environment Variables
Create a `.env.local` file in the root of the project with the following keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# API Keys
GEMINI_API_KEY=your-google-ai-studio-api-key
NEXT_PUBLIC_NASA_API_KEY=your-nasa-api-key-optional
```

### Running Locally
1. Ensure Node.js (v20+ or v22+) is installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Production Deployment
1. Push the code to a Git provider (GitHub, GitLab, etc.).
2. Import the project into Vercel.
3. Configure the exact same environment variables under **Settings > Environment Variables** on Vercel.
4. Deploy.

---

## 2. API Documentation

### A. Astronomy Calculations Endpoint
* **Endpoint:** `GET /api/astronomy`
* **Query Parameters:**
  - `latitude` (required): Latitude decimal degrees
  - `longitude` (required): Longitude decimal degrees
  - `days` (optional): Set to `7` to get calendar range calculations.
  - `startDate` (optional): Date string (e.g. `2026-07-16`) to start calendar calculations.
  - `target` (optional): Name of a planet or DSO (e.g., `orion`, `jupiter`) to get visibility path and Bortle dark sky recommendations.
* **Response Format (Single Day / Default):**
  ```json
  {
    "moon": { "illumination": 4, "age": "2.0", "rise": "5:39 PM", "set": "7:36 AM" },
    "jupiter": { "rise": "3:57 PM" },
    "sun": { "sunrise": "3:08 PM", "sunset": "5:55 AM" },
    "recommendations": [
      {
        "id": "andromeda",
        "name": "Andromeda Galaxy",
        "catalog": "M31",
        "type": "Galaxy",
        "altitude": 22,
        "azimuth": 54,
        "rating": 96,
        "equipment": "Telephoto or 50mm+ lens",
        "isVisible": true
      }
    ]
  }
  ```

### B. Image Recognition / Classification Endpoint
* **Endpoint:** `POST /api/recognize`
* **Request Format:**
  ```json
  {
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }
  ```
* **Response Format:**
  ```json
  {
    "objects": [
      {
        "name": "Orion Constellation",
        "type": "constellation",
        "confidence": 0.98,
        "description": "Located clearly in the center right with Betelgeuse and Rigel bright."
      }
    ]
  }
  ```

---

## 3. Kaggle Dataset Guidance for Custom Sky Object Classifiers

If you want to train a custom computer vision model (e.g., CNN or Vision Transformer) to recognize constellations and deep sky objects from mobile photos, look for (or build) a dataset with these characteristics:

1. **Diverse Sky Conditions (Essential):** 
   - Light pollution variance: Images taken in Bortle 1 (pristine dark sky) through Bortle 9 (inner-city sky).
   - Atmospheric transparency (seeing, moisture, light cloud haze).
   - Equipment variety: Photos taken with DSLRs, smartphones, and wide-angle lenses.
2. **Labeling Schema (Standardized):**
   - Coordinate annotations (RA/Dec bounding boxes) or pixel masks for constellation lines.
   - Target classifications: Constellations (88 standard IAU groups), Deep Sky Objects (Messier and NGC catalog identifiers), and common planets.
3. **Data Volume:** 
   - At least 10,000 labeled images to achieve high validation accuracy for basic constellation boundaries.
   - Augmentation strategies should include horizontal/vertical flips, brightness variations (simulating light pollution), and rotational variances (since stars rotate depending on the hemisphere and time).
