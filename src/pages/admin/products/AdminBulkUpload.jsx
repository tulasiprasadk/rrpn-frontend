import React, { useRef, useState } from "react";
import "./AdminBulkUpload.css";

export default function AdminBulkUpload() {
  const [csvText, setCsvText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const fileInputRef = useRef(null);

  const sampleCSV = `title,variety,subVariety,price,unit,description,categoryId,categoryName
Red Roses Bouquet,Bouquets,Small Bouquet,150,piece,Beautiful small red roses bouquet perfect for gifting,4,Flowers
Marigold Garland,Garlands,Large Garland,200,piece,Colorful marigold garland for decoration,4,Flowers
Flower Pots Small,GROUND CRACKERS,,120,box,,8,Crackers
Flower Pots Big,GROUND CRACKERS,,250,box,,8,Crackers
Sparklers 7cm,SPARKLERS,,90,box,,8,Crackers
`;

  const loadSample = () => setCsvText(sampleCSV);

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_bulk_upload.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => setCsvText(loadEvent.target?.result || "");
    reader.readAsText(file);
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      return {
        title: row.title,
        variety: row.variety || null,
        subVariety: row.subVariety || null,
        price: Number(row.price) || 0,
        unit: row.unit || null,
        description: row.description || null,
        CategoryId: row.categoryId ? Number(row.categoryId) : null,
        categoryName: row.categoryName || null,
      };
    });
  };

  const handleBulkUpload = async () => {
    if (!csvText.trim()) {
      alert("Please paste or upload CSV data");
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const products = parseCSV(csvText);
      const chunkSize = 100;
      let totalCreated = 0;
      let totalUpdated = 0;
      let totalErrors = 0;

      for (let index = 0; index < products.length; index += chunkSize) {
        const chunk = products.slice(index, index + chunkSize);
        const response = await fetch(
          `/api/products/bulk${replaceExisting ? "?mode=replace" : ""}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: chunk }),
          }
        );

        const raw = await response.text();
        let data = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch (error) {
          data = { error: raw || "Bulk upload failed" };
        }

        if (!response.ok) {
          alert(data?.error || "Bulk upload failed");
          return;
        }

        totalCreated += data?.created || 0;
        totalUpdated += data?.updated || 0;
        totalErrors += data?.errors || 0;
      }

      const summary = {
        created: totalCreated,
        updated: totalUpdated,
        errors: totalErrors,
      };

      setResult(summary);
      alert(
        `Success! ${summary.created} products created, ${summary.updated} products updated, ${summary.errors} errors.`
      );

      if (summary.errors === 0) {
        setCsvText("");
      }
    } catch (error) {
      console.error(error);
      alert("Server error during bulk upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bulk-upload-container">
      <h1>Bulk Product Upload</h1>

      <div className="bulk-upload-actions">
        <button className="admin-button outline" onClick={downloadSample}>
          Download Sample CSV
        </button>
        <button className="admin-button outline" onClick={loadSample}>
          Load Sample CSV
        </button>
        <button
          className="admin-button outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose CSV File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          hidden
        />
      </div>

      <textarea
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        placeholder="Paste CSV data here..."
        rows={15}
      />

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "12px 0",
          color: "#444",
        }}
      >
        <input
          type="checkbox"
          checked={replaceExisting}
          onChange={(event) => setReplaceExisting(event.target.checked)}
        />
        Replace matching old products with the uploaded data
      </label>

      <button
        className="admin-button primary"
        onClick={handleBulkUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Products"}
      </button>

      {result && (
        <div className="bulk-upload-result">
          <p>Created: {result.created}</p>
          <p>Updated: {result.updated || 0}</p>
          <p>Errors: {result.errors}</p>
        </div>
      )}
    </div>
  );
}
