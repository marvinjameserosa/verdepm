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
import { Truck, Plus, Trash2 } from "lucide-react";
import { VehicleEntry } from "@/types/construction";

interface VehicleLogisticsCardProps {
  vehicleList: VehicleEntry[];
  setVehicleList: (list: VehicleEntry[]) => void;
}

export function VehicleLogisticsCard({
  vehicleList,
  setVehicleList,
}: VehicleLogisticsCardProps) {
  const addVehicle = () => {
    setVehicleList([
      ...vehicleList,
      { id: crypto.randomUUID(), name: "", fuelRate: "", distance: "" },
    ]);
  };

  const removeVehicle = (id: string) => {
    setVehicleList(vehicleList.filter((v) => v.id !== id));
  };

  const updateVehicle = (
    id: string,
    field: keyof VehicleEntry,
    value: string
  ) => {
    setVehicleList(
      vehicleList.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const totalFuel = vehicleList.reduce((sum, v) => {
    const dist = parseFloat(v.distance) || 0;
    const rate = parseFloat(v.fuelRate) || 0;
    return sum + dist * rate;
  }, 0);

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Vehicle Logistics
          </CardTitle>
          <CardDescription className="mt-1">
            Track fuel consumption for multiple vehicles.
          </CardDescription>
        </div>
        <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
          <Truck className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {vehicleList.map((vehicle) => (
          <div key={vehicle.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4 space-y-1">
              <Label className="text-xs">Vehicle Name</Label>
              <Input
                value={vehicle.name}
                onChange={(e) =>
                  updateVehicle(vehicle.id, "name", e.target.value)
                }
                placeholder="e.g. Truck 1"
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Label className="text-xs">Distance (km)</Label>
              <Input
                type="number"
                value={vehicle.distance}
                onChange={(e) =>
                  updateVehicle(vehicle.id, "distance", e.target.value)
                }
                placeholder="0"
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Label className="text-xs">Fuel Rate (L/km)</Label>
              <Input
                type="number"
                value={vehicle.fuelRate}
                onChange={(e) =>
                  updateVehicle(vehicle.id, "fuelRate", e.target.value)
                }
                placeholder="0"
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => removeVehicle(vehicle.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          onClick={addVehicle}
        >
          <Plus className="h-3 w-3 mr-2" />
          Add Vehicle
        </Button>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Total Estimated Fuel:</span>
            <span>{totalFuel.toFixed(2)} L</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
