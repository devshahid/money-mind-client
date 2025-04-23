import React, { useState } from "react";
import * as XLSX from "xlsx";
import axiosClient from "../services/axiosClient";

type RowData = Record<string, string>;

const REQUIRED_HEADERS = [
  "date",
  "narration",
  "refNumber",
  "withdrawlAmount",
  "depositAmount",
  "closingBalance",
];

const UploadPreview: React.FC = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [mergeKey, setMergeKey] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const [headers, setHeaders] = useState<string[]>(() =>
    data.length > 0 ? Object.keys(data[0]) : []
  );

  const handleHeaderChange = (index: number, newValue: string) => {
    const updated = [...headers];
    updated[index] = newValue;
    setHeaders(updated);
  };

  const validateHeaders = (
    headers: string[]
  ): { valid: boolean; missing: string[] } => {
    const lowerCaseHeaders = headers.map((h) => h.trim().toLowerCase());
    const missing = REQUIRED_HEADERS.filter(
      (req) => !lowerCaseHeaders.includes(req.toLowerCase())
    );
    return { valid: missing.length === 0, missing };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const header = rawData[0];
      const body = rawData.slice(1);
      const { valid, missing } = validateHeaders(header);

      if (!valid) {
        console.log(`Missing required headers: ${missing.join(", ")}`);
        return;
      }

      console.log("valid: ", valid, missing);
      // check date, narration, refNumber, withdrawlAmount, depositAmount, closingBalance is in header or not

      const rows = mergeRows(body, header, mergeKey || header[0]);
      setData(rows);
      setPreview(true);
    };
    reader.readAsBinaryString(file);
  };

  const mergeRows = (
    rows: any[][],
    headers: string[],
    keyField: string
  ): RowData[] => {
    const keyIdx = headers.indexOf(keyField);
    const merged: any[][] = [];
    let currentRow: any[] | null = null;

    rows.forEach((row) => {
      if (row[keyIdx]) {
        if (currentRow) merged.push(currentRow);
        currentRow = [...row];
      } else if (currentRow) {
        currentRow = currentRow.map((val, idx) =>
          typeof val === "string"
            ? val + " " + (row[idx] || "")
            : val || row[idx]
        );
      }
    });

    if (currentRow) merged.push(currentRow);
    return merged.map((row) =>
      headers.reduce((obj: RowData, key: string, i: number) => {
        obj[key] = row[i] || "";
        return obj;
      }, {})
    );
  };

  const handleDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...data];
    updated[index][field] = value;
    setData(updated);
  };

  const handleSave = async () => {
    try {
      const response = await axiosClient.post(
        "transaction-logs/upload-data-from-file",
        { rows: data }
      );
      console.log("response", response.data);
      //   await axios.post("http://localhost:3001/save-statement", { rows: data });
      alert("Saved to DB!");
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  return (
    <div>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
      <input
        type="text"
        placeholder="Enter key field (e.g., Date)"
        onChange={(e) => setMergeKey(e.target.value)}
      />
      {preview && (
        <>
          <table border={1}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((header, idx) => (
                  <th key={idx}>
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => handleHeaderChange(idx, e.target.value)}
                      style={{
                        width: "100%",
                        fontWeight: "bold",
                        border: "none",
                        backgroundColor: "transparent",
                      }}
                    />
                  </th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.entries(row).map(([k, v], number) => (
                    <td key={number}>
                      <input
                        value={v}
                        onChange={(e) => handleChange(i, k, e.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => handleDelete(i)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSave}>Save to DB</button>
        </>
      )}
    </div>
  );
};

export default UploadPreview;
