import { useState, useEffect, useCallback } from "react";
import { SourcedMaterial } from "@/types/construction";
import { getSourcingMaterials } from "@/actions/construction/fetch";

export function useSourcingMaterials(projectId: string | undefined) {
  const [sourcingMaterials, setSourcingMaterials] = useState<SourcedMaterial[]>(
    []
  );
  const [materialFetchError, setMaterialFetchError] = useState<string | null>(
    null
  );
  const [materialLoading, setMaterialLoading] = useState(false);

  const loadSourcingMaterials = useCallback(async () => {
    setMaterialLoading(true);
    setMaterialFetchError(null);

    try {
      if (!projectId) {
        setSourcingMaterials([]);
        return;
      }

      const { data, error } = await getSourcingMaterials(projectId);

      if (error) {
        setMaterialFetchError(error);
        setSourcingMaterials([]);
      } else {
        setSourcingMaterials(data);
      }
    } catch (error) {
      console.error("Failed to load sourcing materials", error);
      setMaterialFetchError("Failed to load sourcing materials.");
      setSourcingMaterials([]);
    } finally {
      setMaterialLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadSourcingMaterials();
  }, [loadSourcingMaterials]);

  return {
    sourcingMaterials,
    materialFetchError,
    materialLoading,
    refreshMaterials: loadSourcingMaterials,
  };
}
