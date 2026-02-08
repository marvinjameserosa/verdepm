import { useState, useEffect } from "react";
import { getPostConstructionData } from "@/actions/post-construction";
import { AggregatedPostConstructionData } from "@/types/post-construction";

export function usePostConstructionData(projectId: string) {
  const [data, setData] = useState<AggregatedPostConstructionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPostConstructionData(projectId);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch post-construction data:", err);
          setError("Failed to load data. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (projectId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  return { data, isLoading, error };
}
