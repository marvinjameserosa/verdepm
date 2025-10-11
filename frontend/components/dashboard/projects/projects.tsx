"use client";

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
import { projects } from "@/lib/data";
import { AddProjectModal } from "./add-project-modal";
import { cn } from "@/lib/utils";

const getStatusColor = (status: string) => {
  switch (status) {
    case "On Track":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "Delayed":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "Completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800";
  }
};

export default function ProjectsTab() {
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
                  <DropdownMenuCheckboxItem checked>
                    On Track
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Delayed</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AddProjectModal />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
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
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-medium border text-xs px-2.5 py-1",
                      getStatusColor(project.status)
                    )}
                  >
                    {project.status}
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
                      Timeline
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                      <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">Team</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-2">
                      <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Progress
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
