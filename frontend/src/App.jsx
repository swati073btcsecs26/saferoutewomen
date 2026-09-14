import { useState } from "react";
import RouteForm from "./components/RouteForm.jsx";
import RouteResults from "./components/RouteResults.jsx";
import SosPanel from "./components/SosPanel.jsx";
import { searchRoutes } from "./api.js";

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await searchRoutes(payload);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">SafeRoute AI</div>
        <div className="tagline">The fastest route is not always the right route.</div>
      </div>

      <RouteForm onSearch={handleSearch} loading={loading} />

      {error && <div className="error-banner">Could not reach backend: {error}. Is the backend running on port 5000?</div>}

      <RouteResults data={results} />

      <SosPanel />

      <div className="footer-note">
        SafeRoute AI &middot; AI/ML for Context-Aware Women's Travel Recommendations
      </div>
    </div>
  );
}
