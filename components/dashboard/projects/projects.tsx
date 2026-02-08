"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListFilter, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorDisplay } from "@/components/ui/error-display";
import { AddProjectModal } from "./add-project-modal";
import type { Project, ProjectStatus } from "@/types/project";
import { projectStatusLabels } from "@/lib/projects";
import { ProjectCard } from "./project-card";
import { useProjects } from "@/hooks/useProjects";

const STATUS_FILTER_ORDER: ProjectStatus[] = [
  "planning",
  "in-progress",
  "on-hold",
  "completed",
];

export default function ProjectsTab() {
  const { projectList, isLoading, errorMessage, addProject, refreshProjects } =
    useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] =
    useState<ProjectStatus[]>(STATUS_FILTER_ORDER);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projectList.filter((project) => {
      const matchesStatus = selectedStatuses.includes(project.status);
      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        project.name,
        project.description ?? "",
        project.clientName ?? "",
        project.location ?? "",
        project.category ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [projectList, searchTerm, selectedStatuses]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (
    status: ProjectStatus,
    checked: boolean | "indeterminate"
  ) => {
    setSelectedStatuses((current) => {
      if (checked) {
        if (current.includes(status)) {
          return current;
        }
        return [...current, status];
      }
      const next = current.filter((value) => value !== status);
      return next.length > 0 ? next : STATUS_FILTER_ORDER;
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your construction projects
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="w-full sm:w-[280px] lg:w-[320px] pl-9 rounded-xl"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 rounded-xl"
                  >
                    <ListFilter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {STATUS_FILTER_ORDER.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) =>
                        handleStatusFilterChange(status, checked)
                      }
                    >
                      {projectStatusLabels[status]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <AddProjectModal onProjectCreated={addProject} />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="sm:col-span-2 lg:col-span-3 h-32 flex items-center justify-center border border-dashed">
            <CardContent className="text-center text-muted-foreground">
              Loading projects...
            </CardContent>
          </Card>
        ) : errorMessage ? (
          <ErrorDisplay
            title="Failed to load projects"
            message={errorMessage}
            className="sm:col-span-2 lg:col-span-3"
          />
        ) : filteredProjects.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3 border border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              No projects match your filters yet.
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRefresh={refreshProjects}
            />
          ))
        )}
      </div>
    </div>
  );
}
