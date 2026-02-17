// ResultDisplay.jsx - VeriDoc frontend component placeholder

import React from "react";

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Result:</h3>
      <div
        style={{
          padding: "15px",
          background: "#f4f4f4",
          borderRadius: "5px",
        }}
      >
        {result.answer || JSON.stringify(result)}
      </div>
    </div>
  );
};

export default ResultDisplay;
