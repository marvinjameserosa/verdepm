"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList } from "lucide-react";
import { type EsgTarget, type Material } from "./types";

type Props = {
  onBack: () => void;
  materials: Material[];
  targets: EsgTarget[];
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Step3ReviewPlans({
  onBack,
  materials,
  targets,
}: Props) {
  const formatCost = (value: string) => {
    if (!value) {
      return "-";
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }
    return numberFormatter.format(numericValue);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-4xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Step 3: Review Plans
          </CardTitle>
          <CardDescription>
            Review the defined targets and material sourcing plan before
            proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h4 className="font-semibold mb-2">Project ESG Targets</h4>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Metric / KPI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                        No ESG targets captured yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {targets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>
                        <Badge variant="secondary">{target.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{target.goal}</TableCell>
                      <TableCell>{target.metric}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Material Sourcing Plan</h4>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material / Supplier</TableHead>
                    <TableHead>Vetting Notes</TableHead>
                    <TableHead>Budgeted Cost</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        No materials added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map((mat) => (
                      <TableRow key={mat.id}>
                        <TableCell>
                          <div className="font-medium">{mat.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {mat.supplier}
                          </div>
                          {mat.warehouse && (
                            <div className="text-xs text-muted-foreground">
                              Warehouse: {mat.warehouse}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {mat.notes}
                        </TableCell>
                        <TableCell>
                          {formatCost(mat.cost)}{" "}
                          <span className="text-xs text-muted-foreground">
                            {mat.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              mat.status === "Vetted"
                                ? "default"
                                : mat.status === "Denied"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {mat.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Previous
            </Button>
            <Button>Submit for Approval</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
