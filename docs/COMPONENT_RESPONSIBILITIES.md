# Component & Team Responsibilities

This document defines the clear divisions of responsibility for our 4-person hackathon team over the next 15 days. Clean boundaries prevent task duplication and ensure smooth integration points.

---

## 1. Team Leader (AI/Gemini, MongoDB, Validation, Architecture)

* **Core Focus**: Core data reliability engine, AI prompt engineering, database schemas, validation logic, system design, and final integration.

### ✅ Responsible For:
* **System Architecture**: Designing the data flow, database schemas, and ensuring modules fit together seamlessly.
* **Gemini AI Integration**: Writing system prompts, configuring model parameters (temperature, JSON mode), handling Google GenAI SDK calls, and managing API response mapping.
* **Validation Engine**: Writing the server-side validator that checks Gemini outputs for correctness, range safety, missing values, and calculates the confidence score.
* **MongoDB Schemas**: Defining Mongoose/MongoDB schemas for products, processing audits, and metadata tracking.
* **Integration & Deployment**: Choreographing the end-to-end integration and deploying the React frontend (Vercel/Netlify) and Express backend (Render/Railway/Atlas).

### ❌ NOT Responsible For:
* Writing custom REST endpoints for standard CRUD actions (e.g. fetching lists of products, sorting, editing).
* Setting up the Express boilerplate server or CORS headers.
* Writing parsing functions for PDFs, Excel, or images.
* Designing React components, hooks, dashboard layouts, or UI stylesheets.

---

## 2. Frontend Teammate (React Dashboard)

* **Core Focus**: Designing an intuitive, responsive, and beautiful dashboard interface for upload and verification.

### ✅ Responsible For:
* **Upload Interface**: Building a drag-and-drop file uploader with validation warnings for file format/size.
* **Dashboard Views**: Creating product catalogues, grid/list tables, advanced search, filtering, and detail drawers.
* **Validation Failure Highlighting**: Building UI markers (error badges, yellow input outlines) showing fields flagged by the backend's validation engine.
* **Manual Override Panels**: Creating forms that allow users to fix incorrect validation values and save changes back to MongoDB via backend APIs.
* **State Management & Fetching**: Implementing React hooks or context to manage uploads, API calls, and loading animations.

### ❌ NOT Responsible For:
* Writing backend API endpoints, controllers, or routers.
* Writing database schemas or making direct queries to MongoDB (All database communication must go through Backend APIs).
* Performing text extraction (OCR) or prompting the Gemini API on the client side.
* Managing API secrets or backend `.env` variables.

---

## 3. Backend Teammate (Node.js, Express & APIs)

* **Core Focus**: Server infrastructure, REST API routing, file upload middleware, and pipeline choreography.

### ✅ Responsible For:
* **Server Boilerplate**: Initializing Express, configuring CORS, body-parsers, and error-handling middleware.
* **API Endpoints**: Creating REST API routes for file uploading, fetching products list, retrieving a single product, updating a product (manual overrides), and deleting products.
* **File Upload Pipeline**: Setting up `multer` or alternative file-saving middleware to receive uploaded documents and store them temporarily.
* **Pipeline Orchestrator**: Creating the controller function that takes the uploaded file, calls the OCR module, passes OCR output to the Team Leader's Gemini module, feeds Gemini output to the Validation engine, and stores the result in MongoDB.
* **Backend Security**: Setting up basic rate limiters, validation on route inputs, and checking environment variables.

### ❌ NOT Responsible For:
* Designing prompt templates or AI logic (handled by Team Leader).
* Developing the raw text extraction algorithms for files (handled by OCR teammate).
* Writing React code, frontend forms, dashboards, or stylesheets.
* Designing final data models and validation rules (handled by Team Leader).

---

## 4. OCR Teammate (Document Parsers & OCR)

* **Core Focus**: File parsing, raw text extraction, table layout parsing, and output formatting.

### ✅ Responsible For:
* **PDF Extraction Module**: Writing logic to extract clean raw text, page structure, and metadata from both searchable and scanned PDF files.
* **Image OCR Module**: Implementing image pre-processing (e.g. contrast, resizing) and Tesseract.js/Vision API logic to extract raw text from catalog images.
* **Excel Parsing Module**: Writing scripts to extract rows, columns, and spreadsheet sheets into clean markdown tables or raw structured text strings.
* **Text Normalizer**: Creating a utility function that formats different text streams (from PDF, Image, Excel) into a clean, uniform UTF-8 string ready for AI consumption.

### ❌ NOT Responsible For:
* Writing Express.js routes or controller logic.
* Writing MongoDB database queries or models.
* Interacting with the Gemini API.
* Implementing UI upload buttons or frontend code.

---

## 5. Summary Responsibility Matrix

| Tasks | OCR Teammate | Backend Teammate | Team Leader | Frontend Teammate |
| :--- | :---: | :---: | :---: | :---: |
| **File Parsing & OCR** | 🟢 **Lead** | ⚪ Support | ⚪ None | ⚪ None |
| **Server Ingestion & APIs** | ⚪ None | 🟢 **Lead** | ⚪ Support | ⚪ None |
| **Gemini Integration** | ⚪ None | ⚪ Support | 🟢 **Lead** | ⚪ None |
| **Validation / Confidence** | ⚪ None | ⚪ Support | 🟢 **Lead** | ⚪ None |
| **DB Schema Design** | ⚪ None | ⚪ Support | 🟢 **Lead** | ⚪ None |
| **UI/UX & React App** | ⚪ None | ⚪ None | ⚪ Support | 🟢 **Lead** |
| **Deployment / DevOps**| ⚪ Support | ⚪ Support | 🟢 **Lead** | ⚪ Support |
