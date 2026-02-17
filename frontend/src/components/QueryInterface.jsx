// QueryInterface.jsx - VeriDoc frontend component placeholder

import React, { useState } from "react";
import { queryDocument } from "../services/api";

const QueryInterface = ({ token, setResult }) => {
  const [query, setQuery] = useState("");

  const handleQuery = async (e) => {
    e.preventDefault();

    try {
      const res = await queryDocument({ question: query });
      setResult(res.data);
    } catch (error) {
      alert("Query failed");
    }
  };

  return (
    <div>
      <h2>Ask About Document</h2>
      <form onSubmit={handleQuery}>
        <input
          type="text"
          placeholder="Enter your question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <br /><br />
        <button type="submit">Ask</button>
      </form>
    </div>
  );
};

export default QueryInterface;
