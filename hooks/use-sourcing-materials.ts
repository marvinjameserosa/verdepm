import { useState, useEffect } from "react";
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

  useEffect(() => {
    let isMounted = true;

    const loadSourcingMaterials = async () => {
      setMaterialLoading(true);
      setMaterialFetchError(null);

      try {
        if (!projectId) {
          if (!isMounted) return;
          setSourcingMaterials([]);
          return;
        }

        const { data, error } = await getSourcingMaterials(projectId);

        if (!isMounted) return;

        if (error) {
          setMaterialFetchError(error);
          setSourcingMaterials([]);
        } else {
          setSourcingMaterials(data);
        }
      } catch (error) {
        console.error("Failed to load sourcing materials", error);
        if (!isMounted) return;
        setMaterialFetchError("Failed to load sourcing materials.");
        setSourcingMaterials([]);
      } finally {
        if (isMounted) {
          setMaterialLoading(false);
        }
      }
    };

    void loadSourcingMaterials();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  return {
    sourcingMaterials,
    materialFetchError,
    materialLoading,
  };
}
