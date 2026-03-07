// src/services/api.js

import axios from "axios";

const API_BASE = "http://localhost:8000";

export const runGraph = async (nodes, prompt) => {
  try {
    const response = await axios.post(`${API_BASE}/run_graph`, {
      nodes,
      prompt,
    });
    return response.data.output;
  } catch (error) {
    console.error("Network/API Error:", error);
    throw error;
  }
};