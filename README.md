# Universal HR Letter & Letterhead Generator

A complete, production-ready, multi-company HR letter generation and automated letterhead platform. Enables any legitimate organization to configure its own branding, design custom letterheads, manage employee records, import batch rosters via Excel, and issue professional, print-ready HR documents.

---

## 🌟 Key Capabilities & Modules

### 1. Multi-Company Organization Workspace
- Generic and multi-company capable (IT, BPOs, consultancies, startups, agencies, manufacturing).
- Configurable registered addresses, corporate offices, tax/CIN identifiers, official seals, and authorized signatories.
- Tenant isolation across companies, employees, letterheads, and document history.

### 2. Universal Letterhead Designer
- **7 Professional Built-in Presets:**
  - *Corporate Minimal* (Contemporary clean blue)
  - *Modern Professional* (Teal accent, right-aligned branding)
  - *Traditional Corporate* (Centered legal layout with double border)
  - *Formal Legal & Disciplinary* (Monochrome formal styling)
  - *Clean HR* (Human Resources specialized theme)
  - *Executive Letterhead* (Warm crimson, leadership communications)
  - *Simple Black & White* (High-contrast minimal)
- Live interactive A4 / Letter page preview with real-time typography, margins, header/footer, and company seal rendering.

### 3. Comprehensive HR Document Template Library
Extensive library covering all employment lifecycle stages:
- **Employment & Onboarding:** Job Offer Letter, Appointment Letter, Employment Confirmation, Probation Confirmation, Promotion & Increment Letter, Internship Offer, Relocation Letter.
- **Resignation & Separation:** Resignation Acceptance, Relieving Letter, Experience & Service Certificate, Employment Verification, Exit Clearance.
- **Disciplinary & Performance:** Final Warning Letter regarding Workplace Conduct (matching corporate standards), Performance Improvement Plan (PIP) Letter with defined duration periods, First Written Warning, Show-Cause Notice.
- **General HR & Certifications:** Salary & Earnings Certificate (for bank loans/visas), Proof of Employment, No-Objection Certificate (NOC).
- **Custom Templates:** Administrators can create, clone, and manage bespoke company templates with dynamic `{{placeholders}}`.

### 4. Excel Batch Upload & Bulk Issuance
- Upload spreadsheets (`.xlsx`, `.xls`, `.csv`) containing:
  - `Employee Name`
  - `Employee ID`
  - `Letter Date` (Issue date)
  - `Effective Date` (Date from which the letter takes effect)
  - `Time Period` / `PIP Duration` (e.g. 30 Days, 60 Days)
  - `Designation`, `Department`, `Reporting Manager`, and `Reason`
- Pre-upload validation, row error highlighting, sample template download, and one-click bulk generation.

### 5. Dedicated High-Risk Workflows
- **Unauthorized Absence & Job Abandonment:** Neutral show-cause notices with configurable 48-hour response windows and documented outreach attempts (preventing premature absconding claims).
- **Termination Letter Builder:** Explicit statutory safeguards, jurisdiction validation, handover/property return instructions, payment-in-lieu calculation, and mandatory executive reviewer sign-off.

### 6. Document Generation & Export Formats
- **Microsoft Word (.docx):** Native `.docx` files with structured headings, margins, headers, footers, signature blocks, and employee receipt acknowledgements.
- **Print-Ready PDF:** Vector-scaled, print-ready document exports with exact page boundaries and preserved company seals.

### 7. Approvals & Audit Trail
- Multi-level document review (Draft → Under Review → Approved → Issued).
- Immutable security audit trail recording creation, updates, approvals, downloads, and batch runs with Excel export.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Demo Credentials
The application automatically seeds a demo environment on first launch:
- **Email:** `admin@demo.com`
- **Password:** `admin123`
*(Auto-fill button provided on the login screen for one-click access)*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 with TypeScript |
| **Build Tool** | Vite |
| **UI Components** | Ant Design (antd v5) & Ant Design Icons |
| **State & Storage** | React Context + Dexie.js (IndexedDB) |
| **Word Export** | `docx` (Native OpenXML generator) |
| **PDF Export** | `jspdf` + `html2canvas` |
| **Excel Processing** | `xlsx` (SheetJS) |
| **Routing** | React Router v6 |
| **Deployment** | Docker & Docker Compose |
