import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Users,
  Target,
  MapPin,
  Hash,
  Wallet,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import {
  projectPriorityLabels,
  projectStatusBadgeClass,
  projectStatusLabels,
} from "./project-helpers";
import { DeleteProjectButton } from "./delete-project-button";

type ProjectCardProps = {
  project: Project;
  onRefresh?: () => Promise<void>;
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
  const endDisplay = project.endDate
    ? formatDate(project.endDate) ?? "TBD"
    : null;

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

  return `PHP ${numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

export function ProjectCard({ project, onRefresh }: ProjectCardProps) {
  return (
    <div className="group relative h-full">
      <Link
        href={`/dashboard/projects/${project.slug}`}
        className="block h-full"
      >
        <Card className="h-full glassmorphism card-hover border-l-4 border-l-primary overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 pointer-events-none"></div>

          <CardHeader className="relative pb-4 z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold mb-1">
                    {project.name}
                  </CardTitle>
                  {project.clientName ? (
                    <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                      Client: {project.clientName}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="pr-10">
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-semibold border-2 text-xs px-3 py-1.5 shadow-sm",
                    projectStatusBadgeClass[project.status]
                  )}
                >
                  {projectStatusLabels[project.status]}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-muted-foreground mt-4 line-clamp-2 leading-relaxed text-sm">
              {project.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative pt-0 z-10">
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-chart-1/10 mb-2">
                  <Calendar className="h-4 w-4 text-chart-1" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {formatTimeline(project)}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-chart-2/10 mb-2">
                  <Users className="h-4 w-4 text-chart-2" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {project.projectManager ?? "Team"}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-chart-3/10 mb-2">
                  <Target className="h-4 w-4 text-chart-3" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {project.priority
                    ? projectPriorityLabels[project.priority]
                    : "Priority"}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-chart-4/10 mb-2">
                  <MapPin className="h-4 w-4 text-chart-4" />
                </div>
                <span
                  className="text-xs text-muted-foreground line-clamp-1 font-medium"
                  title={project.location ?? ""}
                >
                  {project.location ?? "No location"}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-chart-5/10 mb-2">
                  <Layers className="h-4 w-4 text-chart-5" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {project.category ?? "Uncategorized"}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 mb-2">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {formatBudget(project.budget)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <DeleteProjectButton
        projectId={project.id}
        projectName={project.name}
        onDelete={onRefresh}
      />
    </div>
  );
}
