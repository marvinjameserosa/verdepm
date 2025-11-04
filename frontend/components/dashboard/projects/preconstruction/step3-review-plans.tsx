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
import { Material } from "./types";

type Props = {
  onBack: () => void;
  materials: Material[];
};

export default function Step3ReviewPlans({ onBack, materials }: Props) {
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
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary">Environmental</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      Reduce Embodied & Operational Carbon
                    </TableCell>
                    <TableCell>&lt; 500 kgCO2e/m²</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary">Environmental</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      Achieve Net-Zero Water
                    </TableCell>
                    <TableCell>100% rainwater harvesting</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary">Social</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      Maintain a Zero-Incident Site
                    </TableCell>
                    <TableCell>0 Lost Time Incidents (LTI)</TableCell>
                  </TableRow>
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
                  {materials.map((mat) => (
                    <TableRow key={mat.id}>
                      <TableCell>
                        <div className="font-medium">{mat.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {mat.supplier}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {mat.notes}
                      </TableCell>
                      <TableCell>
                        ${parseFloat(mat.cost).toLocaleString()}{" "}
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
                  ))}
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
