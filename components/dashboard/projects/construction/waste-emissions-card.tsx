import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";
import {
  WasteFormEntry,
  WasteEntrySummary,
  WASTE_TYPE_OPTIONS,
  WASTE_TREATMENT_OPTIONS,
} from "@/types/construction";

interface WasteEmissionsCardProps {
  newEntry: WasteFormEntry;
  onEntryChange: (field: keyof WasteFormEntry, value: string) => void;
  onAddEntry: () => void;
  entries: WasteEntrySummary[];
  onRemoveEntry: (id: string) => void;
  totalAllocatedMassKg: number;
  totalInputMassKg: number;
  totalEmissionsKg: number;
}

export function WasteEmissionsCard({
  newEntry,
  onEntryChange,
  onAddEntry,
  entries,
  onRemoveEntry,
  totalAllocatedMassKg,
  totalInputMassKg,
  totalEmissionsKg,
}: WasteEmissionsCardProps) {
  const percentageTotalsByWasteType = entries.reduce<Record<string, number>>(
    (accumulator, entry) => {
      accumulator[entry.wasteType] =
        (accumulator[entry.wasteType] ?? 0) + entry.percentageValue;
      return accumulator;
    },
    {}
  );

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Waste Management Summary
          </CardTitle>
          <CardDescription className="mt-1">
            Break down monthly waste streams and treatment methods to compute
            emissions.
          </CardDescription>
        </div>
        <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <Label htmlFor="waste-mass">Total Mass of Waste</Label>
            <div className="flex gap-2">
              <Input
                id="waste-mass"
                type="number"
                min="0"
                value={newEntry.mass}
                onChange={(event) => onEntryChange("mass", event.target.value)}
                placeholder="Enter quantity"
              />
              <Select
                value={newEntry.unit}
                onValueChange={(value) => onEntryChange("unit", value)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ton">ton</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Waste Type</Label>
            <Select
              value={newEntry.wasteType}
              onValueChange={(value) => onEntryChange("wasteType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Treatment Method</Label>
            <Select
              value={newEntry.treatmentMethod}
              onValueChange={(value) => onEntryChange("treatmentMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TREATMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="waste-percentage">Treatment Percentage (%)</Label>
            <Input
              id="waste-percentage"
              type="number"
              min="0"
              max="100"
              value={newEntry.treatmentPercentage}
              onChange={(event) =>
                onEntryChange("treatmentPercentage", event.target.value)
              }
              placeholder="e.g. 25"
            />
          </div>
        </div>
        <Button type="button" onClick={onAddEntry} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Waste Entry
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Total input mass:
            <span className="ml-1 font-semibold">
              {totalInputMassKg > 0
                ? `${totalInputMassKg.toFixed(2)} kg`
                : "--"}
            </span>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Allocated mass (kg):
            <span className="ml-1 font-semibold">
              {totalAllocatedMassKg > 0
                ? `${totalAllocatedMassKg.toFixed(2)} kg`
                : "--"}
            </span>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Total CO₂e emitted:
            <span className="ml-1 font-semibold">
              {totalEmissionsKg > 0
                ? `${totalEmissionsKg.toFixed(2)} kg`
                : "--"}
            </span>
          </div>
        </div>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waste Type</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead className="text-right">Mass</TableHead>
                <TableHead className="text-right">Treatment %</TableHead>
                <TableHead className="text-right">
                  Allocated Mass (kg)
                </TableHead>
                <TableHead className="text-right">CO₂e (kg)</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.wasteType}
                    </TableCell>
                    <TableCell className="capitalize">
                      {entry.treatmentMethod}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(entry.mass).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {entry.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.percentageValue.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.allocatedMassKg.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.emissionKg.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveEntry(entry.id)}
                        aria-label="Remove waste entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No waste entries recorded this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {entries.length > 0 ? (
          <div className="text-xs text-muted-foreground">
            <p className="mb-1">
              Ensure treatment allocations for each waste type total 100%:
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(percentageTotalsByWasteType).map(
                ([wasteType, total]) => (
                  <span
                    key={wasteType}
                    className={
                      Math.abs(total - 100) > 0.001
                        ? "text-red-600 dark:text-red-400"
                        : undefined
                    }
                  >
                    {wasteType}: <strong>{total.toFixed(2)}%</strong>
                  </span>
                )
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Allocate each waste type across treatment methods. Percentages per
            type must add up to 100% before submission.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
