// DocumentUpload.jsx - VeriDoc frontend component placeholder

import React, { useState } from "react";
import { uploadDocument } from "../services/api";

const DocumentUpload = ({ token }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadDocument(formData, token);
      alert("Document uploaded successfully!");
    } catch (error) {
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h2>Upload Document</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br /><br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default DocumentUpload;
