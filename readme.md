# Company Scraper

A Node.js–based web scraper with both CLI and minimal web UI (deployed on Vercel), capable of extracting structured company data at two levels of detail.

---

## Features Implemented

- **Core (Level 1) Extraction**  
  - Accepts a list of seed URLs (via CLI or textarea in the web UI)  
  - Validates URL format  
  - Fetches page HTML with `axios` + timeout & error handling  
  - Parses **Company Name**, **Website URL**, **Email Addresses**, **Phone Numbers**  
  - Outputs results as JSON or CSV  

- **Medium (Level 2) Extraction**  
  - **Social Profiles**: first LinkedIn & Twitter URLs found  
  - **Physical Address**: `<address>` tag or first matching street–style paragraph  
  - **Company Overview / Tagline**: `meta[name=description]`, `og:description`, or first paragraph  
  - **Year Founded**: regex match for “Founded in YYYY”  
  - **Operational Status**: looks for “active” vs. “defunct” cues  
  - **Products / Services**: list items or paragraphs under headings “Products”/“Services”  
  - **Industry / Market Sector**: `meta[name=industry]` or common industry keywords  

- **CLI Interface**  
  - `node index.js --seeds seeds.txt --level <1|2> --format <json|csv>`  
  - Auto‑picks `seeds.txt` if present  
  - Clear console logging of errors & parsing steps  

- **Web UI** (Serverless, deployed on Vercel)  
  - Simple HTML form for pasting seeds and selecting level  
  - Posts to `/api/scrape` (Vercel Function)  
  - Displays JSON results in browser  

---

## Extraction Levels Demonstrated

- **Basic (Level 1)**  
  Core fields: name, website, emails, phones.

- **Medium (Level 2)**  
  Extended contact & company details (social, address, overview, founded, status, products, industry).

> **Advanced (Level 3)** (not implemented)  
> Technical stack detection, current projects, competitors, external API enrichment.

---

## Setup & Run

### Prerequisites

- Node.js 14+  
- (Optional CLI) `commander`, `axios`, `cheerio`, `json2csv`  
- (For deployment) Vercel account


1. **Clone & install**  
   ```bash
   git clone https://github.com/prrranay/company-scraper
   cd company-scraper
   npm install
   ```

2. **Prepare seeds**  
   Create a `seeds.txt` file in the project root, one URL per line:
   ```text
   https://example.com
   https://another-company.io
   ```

3. **Run scraper**  
   ```bash
   # Level 1 JSON
   node index.js --seeds seeds.txt --level 1 --format json

   # Level 2 CSV
   node index.js --seeds seeds.txt --level 2 --format csv
   ```

4. **Output**  
   - `output.json` or `output.csv` in project root.

##or

**Visit** the `https://company-scraper-rust.vercel.app` URL  
   - Paste seeds, choose Level 1 or 2, click “Run Scraper.”  
   - View JSON output in-browser.

---

## Design Decisions & Assumptions

- **Language & Libraries**:  
  Chose Node.js for wide adoption, `axios` for HTTP, `cheerio` for fast HTML parsing, `json2csv` for CSV output.  

- **Level 2 Only**:  
  We implemented “Basic” and “Medium” extraction to balance complexity and demonstrable depth. Advanced insights (tech‑stack, projects, competitors) were deferred.

- **Regex‑based Extraction**:  
  Email and phone patterns use conservative regex + digit‑count filters to avoid false positives (e.g., dates).

- **Minimal Frontend**:  
  A single static HTML page plus a Vercel function gives immediate usability without heavy UI frameworks.

- **Error Handling**:  
  Network timeouts, invalid URLs, and parse failures are logged and returned per‑URL, so a single bad site doesn’t crash the whole job.

- **Stateless & Serverless**:  
  No DB or persistence—each run is ad hoc. Suitable for lightweight lead‑generation tasks.

---

Feel free to fork, adapt, or extend this project to Level 3 or beyond. No sugar‑coating—it does what it does, and it does it clearly.
