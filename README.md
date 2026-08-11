# Certificate Generator - Internal Application 🎓

A simple, fast, and feature-rich application designed to generate single and bulk PDF certificates with live visual preview, custom field positioning, Excel/CSV bulk import, and ZIP downloads.

---

## Features

### 1. Single Certificate Generation
- **Custom Data Fields**:
  - Candidate Name
  - Course Name
  - Duration
  - Issue Date
  - Certificate Number
- **Live Canvas Preview**: Real-time visualization of field text and template positions.
- **One-Click Download**: Generates and downloads standard PDF via `pdf-lib`.

### 2. Bulk Generation (Excel / CSV)
- **Spreadsheet Upload**: Drag-and-drop `.xlsx`, `.xls`, or `.csv` files.
- **Auto Data Mapping**: Parses candidate names, course titles, dates, and certificate numbers automatically.
- **Spreadsheet Data Grid**: Inspect and filter candidate records before generating.
- **ZIP Download**: Generates all certificates in parallel and packages them into a `.zip` file.
- **Sample CSV Helper**: Built-in sample CSV generator for quick testing.

### 3. Template & Field Coordinates Studio
- **Multi-Format Support**:
  - PDF templates (including Canva exports)
  - Image templates (PNG, JPG)
  - Built-in Vector A4 Default Template
- **Visual Coordinate Tuner**: Sliders for X position, Y position, font size, font family, text color, and alignment for every field.

---

## Project Structure

```
certificate/
├── backend/
│   ├── server.js              # Express API (Port 5000)
│   ├── pdfEngine.js           # pdf-lib PDF rendering engine
│   ├── defaultTemplate.js     # Default vector template generator
│   ├── templates/             # Template storage (PDF/PNG/JPG)
│   ├── uploads/               # Temporary spreadsheet uploads
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, SingleGen, BulkGen, TemplateMapper, PreviewCanvas
│   │   ├── App.jsx            # Main app container
│   │   ├── index.css          # Tailwind CSS styling
│   │   └── main.jsx
│   ├── vite.config.js         # Vite config with API proxy
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## How to Run

### 1. Start Backend Server
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Start Frontend Dev Server
Open a new terminal:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express, pdf-lib, XLSX, JSZip, Multer
