# AI-Powered Product Intelligence Platform

![AI-Powered Product Intelligence Platform Banner](docs/images/platform_banner.jpg)

An intelligent, end-to-end data ingestion pipeline built for high-accuracy product categorization, specification extraction, and inventory cataloging. This system automates the processing of raw product sheets (PDFs, images, Excel sheets) into structured, verified, and audited database records.

Designed and architected as a **15-Day Hackathon Project**.

---

## 🚀 The Problem & The Solution

### The Problem
E-commerce managers, suppliers, and distributors receive thousands of product specification sheets, print catalogs, and Excel files in mismatched formats. Manually inputting this data into a centralized database takes hours and leads to frequent typing errors.

### Our Solution
A fast, automated ingestion engine that:
1. **Reads**: Extracts text and tables using custom file parsers and OCR.
2. **Translates**: Uses the power of Google's **Gemini AI** to map arbitrary text into structured JSON models (SKUs, specifications, pricing, currency).
3. **Validates**: Subjects AI outputs to a local **Validation Engine** (never trusting Gemini outputs blindly).
4. **Stores & Flags**: Saves reliable data to MongoDB and flags fields with low confidence/failed validation for human-in-the-loop review.
5. **Presents**: Displays an elegant React dashboard for catalog management and verification review.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Component Dashboard), Axios, Tailwind CSS / Vanilla CSS.
* **Backend**: Node.js & Express.js (Orchestrator).
* **Database**: MongoDB & Mongoose (Audit Logs and Product Inventory).
* **AI Engine**: Google Gemini API via official Google GenAI Node.js SDK.
* **OCR**: Tesseract.js, `pdf-parse`, and `xlsx` parser.

---

## 📁 Architecture & Documentation Links

The system is fully designed and documented across the following resources:

* 📐 **[System Architecture](docs/SYSTEM_ARCHITECTURE.md)**: Explore the overall component diagrams, communication interfaces, technology choices, error-handling matrices, security guidelines, and deployment plan.
* 🔄 **[Data Flow & Schemas](docs/DATA_FLOW.md)**: Track a document’s journey from user upload, text extraction, AI translation, confidence scoring, database storage, to API rendering.
* 👥 **[Component & Team Responsibilities](docs/COMPONENT_RESPONSIBILITIES.md)**: View the exact division of labor, boundaries, and matrix of ownership for the 4 team members.

---

## 🗓️ 15-Day Hackathon Roadmap

To stay on track, our team is executing along three 5-day phases:

### Phase 1 (Days 1–5): Foundation & Parsing
* Setup Express backend boilerplate and Git repository.
* OCR Teammate builds the parsing module (`pdf-parse`, `tesseract.js`, `xlsx`).
* Team Leader designs MongoDB schemas and drafts validation rules.

### Phase 2 (Days 6–10): AI Pipeline & Backend APIs
* Team Leader integrates the Gemini SDK and structures the prompt engineering templates.
* Team Leader writes the Validation & Confidence engine.
* Backend Teammate wires up endpoints (`/upload`, CRUD operations) and orchestrates the data pipeline.
* Frontend Teammate builds the React shell and the file upload UI.

### Phase 3 (Days 11–15): Dashboard UI & Deployment
* Frontend Teammate builds the product grids, filtering, and manual correction forms.
* Integrate frontend to backend APIs.
* Complete end-to-end testing, error handling, and validation boundary audits.
* Deploy frontend (Vercel), backend (Render/Railway), and database (Atlas).
