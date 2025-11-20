import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Users, Target, MapPin, Hash, Wallet, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import {
  projectPriorityLabels,
  projectStatusBadgeClass,
  projectStatusLabels,
} from "./project-helpers";

type ProjectCardProps = {
  project: Project;
};

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

const formatBudget = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return "No budget";
  }

  const numericValue =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : value;

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return `PHP ${numericValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${project.slug}`}
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
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {project.slug}
                  </span>
                </p>
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
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
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
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-muted-foreground line-clamp-1" title={project.location ?? ""}>
                {project.location ?? "No location"}
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-muted-foreground">
                {project.category ?? "Uncategorized"}
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatBudget(project.budget)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
