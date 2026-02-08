import { useEffect, useState, useCallback } from "react";
import { getProjects } from "@/actions/projects/getProjects";
import type { Project } from "@/types/project";

export function useProjects() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { data, error } = await getProjects();

    if (error) {
      setErrorMessage(error);
      setProjectList([]);
    } else {
      setProjectList(data ?? []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = (project: Project) => {
    setProjectList((current) => [project, ...current]);
  };

  return {
    projectList,
    isLoading,
    errorMessage,
    addProject,
    refreshProjects: fetchProjects,
  };
}
