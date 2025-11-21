import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, PackageCheck } from "lucide-react";
import { SourcedMaterial } from "@/types/construction";

interface MaterialSourcingSectionProps {
  materialLoading: boolean;
  sourcingMaterials: SourcedMaterial[];
  materialFetchError: string | null;
}

const MATERIAL_STATUS_BADGE: Record<string, string> = {
  Vetted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Identified: "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
  Denied: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
};

const formatCurrencyValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—";
  }

  const raw =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (!Number.isFinite(raw)) {
    return typeof value === "string" && value.trim().length > 0 ? value : "—";
  }

  return Number(raw).toLocaleString();
};

export function MaterialSourcingSection({
  materialLoading,
  sourcingMaterials,
  materialFetchError,
}: MaterialSourcingSectionProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <PackageCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          Material Sourcing Plan Alignment
        </CardTitle>
        <CardDescription>
          Review the sourcing commitments captured during pre-construction.
          Updates must be made from the pre-construction workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These entries mirror the{" "}
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            Material Sourcing &amp; Due Diligence
          </span>{" "}
          table completed before groundbreaking. Use this list to confirm
          deliveries match the approved sourcing strategy.
        </p>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Planned Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Budgeted Cost ($)</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading sourcing plan…
                    </div>
                  </TableCell>
                </TableRow>
              ) : sourcingMaterials.length > 0 ? (
                sourcingMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">
                      {material.name}
                    </TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell>{material.supplier}</TableCell>
                    <TableCell>{material.warehouse ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyValue(material.cost)}
                    </TableCell>
                    <TableCell>{material.unit ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-transparent ${
                          MATERIAL_STATUS_BADGE[material.status] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {material.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-muted-foreground"
                  >
                    {materialFetchError ??
                      "No sourcing records found. Capture materials in the pre-construction workflow to populate this table."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
