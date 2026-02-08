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
import { Badge } from "@/components/ui/badge";
import { Construction, ShieldAlert, Target, Save, Eye } from "lucide-react";
import { EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER } from "@/types/construction";
import { EquipmentEntry } from "@/types/construction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

interface DistanceFuelCardProps {
  // Equipment Props
  equipmentList: EquipmentEntry[];
  setEquipmentList: (list: EquipmentEntry[]) => void;

  // Safety Props
  incidentCount: string;
  hoursWorked: string;
  onIncidentCountChange: (value: string) => void;
  onHoursWorkedChange: (value: string) => void;
  computedTrir: number | null;
  safetyTarget: { goal: string; metric: string };

  onSave: () => void;
  isSaving?: boolean;
  history?: any[];
}

export function DistanceFuelCard({
  equipmentList,
  setEquipmentList,
  incidentCount,
  hoursWorked,
  onIncidentCountChange,
  onHoursWorkedChange,
  computedTrir,
  safetyTarget,
  onSave,
  isSaving = false,
  history,
}: DistanceFuelCardProps) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [newEquipment, setNewEquipment] = useState<Omit<EquipmentEntry, "id">>({
    name: "",
    hours: "",
    fuelRate: "",
  });

  const handleAddEquipment = () => {
    if (!newEquipment.name || !newEquipment.hours || !newEquipment.fuelRate) {
      return;
    }
    setEquipmentList([
      ...equipmentList,
      { ...newEquipment, id: crypto.randomUUID() },
    ]);
    setNewEquipment({ name: "", hours: "", fuelRate: "" });
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter((e) => e.id !== id));
  };

  const totalFuel = equipmentList.reduce((acc, curr) => {
    const hours = parseFloat(curr.hours) || 0;
    const rate = parseFloat(curr.fuelRate) || 0;
    return acc + hours * rate;
  }, 0);

  const totalEmissions = totalFuel * EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER;

  return (
    <Card className="glassmorphism card-hover border-l-4 border-l-chart-1 col-span-1 md:col-span-2 lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-chart-1">
            Equipment Emissions Summary and Safety Performance (TRIR)
          </CardTitle>
          <CardDescription className="mt-1">
            Track equipment usage and safety incidents.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="p-2 rounded-lg bg-chart-1/10">
            <Construction className="h-5 w-5 text-chart-1" />
          </div>
          <div className="p-2 rounded-lg bg-chart-5/10">
            <ShieldAlert className="h-5 w-5 text-chart-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Equipment Section */}
        <div className="space-y-4">
          <div className="border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Equipment Emissions
              </h3>
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200"
              >
                Scope 1
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="equipment-name">Vehicle/Equipment Name</Label>
              <Input
                id="equipment-name"
                value={newEquipment.name}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, name: e.target.value })
                }
                placeholder="e.g. Excavator A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment-hours">Hours Used</Label>
              <Input
                id="equipment-hours"
                type="number"
                value={newEquipment.hours}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, hours: e.target.value })
                }
                placeholder="Hours"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment-rate">Fuel Rate (L/hr)</Label>
              <Input
                id="equipment-rate"
                type="number"
                value={newEquipment.fuelRate}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, fuelRate: e.target.value })
                }
                placeholder="L/hr"
              />
            </div>
          </div>

          <Button
            onClick={handleAddEquipment}
            disabled={
              !newEquipment.name ||
              !newEquipment.hours ||
              !newEquipment.fuelRate
            }
            className="w-full md:w-auto"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>

          {equipmentList.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate (L/hr)</TableHead>
                    <TableHead>Fuel (L)</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.hours}</TableCell>
                      <TableCell>{item.fuelRate}</TableCell>
                      <TableCell>
                        {(
                          parseFloat(item.hours) * parseFloat(item.fuelRate)
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEquipment(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
              Total fuel consumed:
              <span className="ml-1 font-semibold">
                {totalFuel > 0 ? `${totalFuel.toFixed(2)} L` : "--"}
              </span>
            </div>
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
              Total CO₂e emitted:
              <span className="ml-1 font-semibold">
                {totalEmissions > 0 ? `${totalEmissions.toFixed(2)} kg` : "--"}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculations assume an emission factor of{" "}
            {EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER} kg CO₂e per liter of fuel
            burned.
          </p>
        </div>

        {/* Safety Section */}
        <div className="space-y-4">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Safety Performance (TRIR)
              </h3>
              <Badge
                variant="outline"
                className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-rose-200"
              >
                Social
              </Badge>
            </div>
            <div className="flex items-center text-xs text-muted-foreground font-normal">
              <Target className="h-3 w-3 mr-1" />
              <span>
                Goal: {safetyTarget.goal} ({safetyTarget.metric})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="safety-incidents">Number of Incidents</Label>
              <Input
                id="safety-incidents"
                type="number"
                value={incidentCount}
                onChange={(event) => onIncidentCountChange(event.target.value)}
                placeholder="Enter recordable incidents"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="safety-hours">Total Hours Worked</Label>
              <Input
                id="safety-hours"
                type="number"
                value={hoursWorked}
                onChange={(event) => onHoursWorkedChange(event.target.value)}
                placeholder="Enter total crew hours"
                min={0}
              />
            </div>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
            Total Recordable Incident Rate:
            <span className="ml-1 font-semibold">
              {computedTrir !== null ? computedTrir.toFixed(2) : "--"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            TRIR is computed as (Incidents × 200,000) ÷ Total Hours Worked. A
            lower value reflects stronger site safety.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Daily Report
              </>
            )}
          </Button>
        </div>

        {history && history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Daily History
            </h4>
            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Fuel (L)
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Equip. Emissions (kg)
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Equip. Emissions (kg)
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Safety TRIR
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {history.map((log, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium">{log.log_date}</td>
                      <td className="px-3 py-2">
                        {log.fuel_consumption_liters ?? "-"}
                      </td>
                      <td className="px-3 py-2">
                        {log.equipment_usage_tco2e ?? "-"}
                      </td>
                      <td className="px-3 py-2">
                        {log.safety_incidents ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Dialog
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Daily Log Details</DialogTitle>
              <DialogDescription>
                Detailed view of the selected daily entry.
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Date:
                    </span>
                    <p>{selectedLog.log_date}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Fuel Consumption:
                    </span>
                    <p>{selectedLog.fuel_consumption_liters ?? 0} L</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Equipment Emissions:
                    </span>
                    <p>{selectedLog.equipment_usage_tco2e ?? 0} kgCO₂e</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Safety TRIR:
                    </span>
                    <p>{selectedLog.safety_incidents ?? "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Scope 1 Emissions:
                    </span>
                    <p>{selectedLog.scope1 ?? 0} kgCO₂e</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
