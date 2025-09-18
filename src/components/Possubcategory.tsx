import React, { useEffect, useState, useRef } from "react";
import { listCuisines } from "../api/endpoints";
import "./SubNavigation.css";

interface Cuisine {
  id: number;
  name: string;
}

interface Props {
  onCuisineSelect?: (cuisine: Cuisine | null) => void;
}

export default function Possubcategory({
  onCuisineSelect,
}: Props): React.ReactElement {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [activeCuisine, setActiveCuisine] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Keep a ref to the latest onCuisineSelect so we can call it without
  // adding it to the fetch effect deps (which would re-run the fetch when
  // the parent re-creates the callback).
  const onCuisineSelectRef = useRef<Props["onCuisineSelect"] | undefined>(
    onCuisineSelect
  );

  useEffect(() => {
    onCuisineSelectRef.current = onCuisineSelect;
  }, [onCuisineSelect]);

  // Load cuisines from API
  useEffect(() => {
    let mounted = true;
    const loadCuisines = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listCuisines();

        if (!mounted) return;

        // Normalize cuisines data
        const cuisineArray = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.results)
          ? (data as any).results
          : [];

        const normalizedCuisines: Cuisine[] = cuisineArray.map(
          (c: any, idx: number) => ({
            id: (typeof c.id === "number" ? c.id : Number(c.id)) || idx + 1,
            name:
              typeof c.name === "string"
                ? c.name
                : typeof c.cuisine_name === "string"
                ? c.cuisine_name
                : typeof c.master_cuisine_name === "string"
                ? c.master_cuisine_name
                : typeof c.master_cuisine === "string"
                ? c.master_cuisine
                : `Cuisine ${idx + 1}`,
          })
        );

        setCuisines(normalizedCuisines);

        // Set first cuisine as active by default and notify callback if present
        if (normalizedCuisines.length > 0) {
          setActiveCuisine(normalizedCuisines[0].id);
          onCuisineSelectRef.current?.(normalizedCuisines[0]);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || "Failed to load cuisines");
          console.error("[Possubcategory] Error loading cuisines:", e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCuisines();
    return () => {
      mounted = false;
    };
    // Intentionally empty deps: we want to fetch once on mount. Use
    // onCuisineSelectRef to call the latest callback without re-running fetch.
  }, []);

  const handleCuisineClick = (cuisine: Cuisine) => {
    setActiveCuisine(cuisine.id);
    onCuisineSelectRef.current?.(cuisine);
  };

  if (loading) {
    return (
      <div className="sub-nav-container">
        <div className="sub-nav-wrapper">
          <div className="sub-nav-item">Loading cuisines...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sub-nav-container">
        <div className="sub-nav-wrapper">
          <div className="sub-nav-item">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-nav-container">
      <div className="sub-nav-wrapper">
        {cuisines.map((cuisine) => (
          <div
            key={cuisine.id}
            className={`sub-nav-item ${
              activeCuisine === cuisine.id ? "active" : ""
            }`}
            onClick={() => handleCuisineClick(cuisine)}
          >
            {cuisine.name}
          </div>
        ))}
      </div>
    </div>
  );
}
