"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ListFilter,
  Search,
  Building2,
  Calendar,
  Users,
  Target,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddProjectModal } from "./add-project-modal";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase/client";
import type { Project, ProjectStatus } from "@/types/project";
import {
  mapProjectFromSupabase,
  projectPriorityLabels,
  projectStatusBadgeClass,
  projectStatusLabels,
} from "./project-helpers";

const STATUS_FILTER_ORDER: ProjectStatus[] = [
  "planning",
  "in-progress",
  "on-hold",
  "completed",
];

export default function ProjectsTab() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>(
    STATUS_FILTER_ORDER
  );

  const formatDate = (value?: string | null) => {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString();
  };

  const formatTimeline = (project: Project) => {
    if (!project.startDate && !project.endDate) {
      return "Timeline";
    }

    const startDisplay = formatDate(project.startDate) ?? "TBD";
    const endDisplay = project.endDate ? formatDate(project.endDate) ?? "TBD" : null;

    return endDisplay ? `${startDisplay} - ${endDisplay}` : startDisplay;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, owner_id, name, slug, description, status, priority, category, project_manager, client_name, location, budget, start_date, end_date, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Failed to load projects", error);
        setErrorMessage(
          error.message || "Unable to load projects. Please try again."
        );
        setProjectList([]);
      } else {
        const nextProjects = (data ?? []).map(mapProjectFromSupabase);
        setProjectList(nextProjects);
      }

      setIsLoading(false);
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleProjectCreated = (project: Project) => {
    setProjectList((current) => [project, ...current]);
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
              <AddProjectModal onProjectCreated={handleProjectCreated} />
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
          <Card className="sm:col-span-2 lg:col-span-3 border border-red-200 bg-red-50 dark:bg-red-950/40">
            <CardContent className="py-6 text-center text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3 border border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              No projects match your filters yet.
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Link
              href={`/dashboard/projects/${project.slug}`}
              key={project.id}
              className="group block transition-all duration-300 hover:scale-[1.02]"
            >
              <Card className="h-full backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl transition-all duration-300">
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-700/50">
                        <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          {project.name}
                        </CardTitle>
                        {project.clientName ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            {project.clientName}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-medium border text-xs px-2.5 py-1",
                        projectStatusBadgeClass[project.status]
                      )}
                    >
                      {projectStatusLabels[project.status]}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative pt-0">
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeline(project)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                        <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.projectManager ?? "Team"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                        <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.priority
                          ? projectPriorityLabels[project.priority]
                          : "Priority"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
