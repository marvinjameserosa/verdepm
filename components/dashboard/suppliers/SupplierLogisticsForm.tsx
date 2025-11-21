"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { units } from "@/lib/project-options";
import { nanoid } from "nanoid";

const materialCategories = [
  "Concrete",
  "Masonry",
  "Structural Steel",
  "Carpentry",
  "Roofing & Waterproofing",
  "Doors & Windows",
  "Interior Finishes",
  "Plumbing",
  "Electrical",
  "Landscaping",
  "Mechanical",
  "Other",
];

export type MaterialSpecificationEntry = {
  id: string;
  materialCategory: string;
  materialName: string;
  specification: string;
  unitOfMeasure: string;
  packingType: string;
  qualityCertificateAttached: boolean;
  storageRequirements: string;
};

export type SupplierLogisticsFormValues = {
  materials: MaterialSpecificationEntry[];
  poNumber: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  quantityOrdered: string;
  vehicleType: string;
  licensePlate: string;
  driverName: string;
  unloadingMethod: string;
  destinationZone: string;
  deliveryReceipt: string;
  unitPrice: string;
  paymentTerms: string;
};

const vehicleTypes = [
  "Flatbed Truck",
  "Dump Truck",
  "Concrete Mixer",
  "Boom Truck",
  "Delivery Van/L300",
];

const unloadingMethods = [
  "Crane / Lifting Equipment",
  "Manual Labor",
  "Pumped",
  "Self-Unloading / Tailgate",
];

const destinationZones = [
  "Staging Area A",
  "Foundation / Basement",
  "Superstructure Zone",
  "Roof Deck",
  "Logistics Gate",
];

const paymentTermsOptions = ["Due on Delivery", "Net 15", "Net 30", "Net 60"];

const buildMaterialEntry = (): MaterialSpecificationEntry => ({
  id: nanoid(),
  materialCategory: "",
  materialName: "",
  specification: "",
  unitOfMeasure: "",
  packingType: "",
  qualityCertificateAttached: false,
  storageRequirements: "",
});

const createInitialFormValues = (): SupplierLogisticsFormValues => ({
  materials: [buildMaterialEntry()],
  poNumber: "",
  scheduledDate: "",
  scheduledTimeSlot: "",
  quantityOrdered: "",
  vehicleType: "",
  licensePlate: "",
  driverName: "",
  unloadingMethod: "",
  destinationZone: "",
  deliveryReceipt: "",
  unitPrice: "",
  paymentTerms: "",
});

type SupplierLogisticsFormProps = {
  onSubmit?: (values: SupplierLogisticsFormValues) => Promise<void> | void;
  projectName?: string | null;
  disabled?: boolean;
  disabledReason?: string | null;
};

export function SupplierLogisticsForm({
  onSubmit,
  projectName,
  disabled = false,
  disabledReason,
}: SupplierLogisticsFormProps) {
  const [formValues, setFormValues] = useState<SupplierLogisticsFormValues>(
    () => createInitialFormValues()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    const generalFieldsFilled = [
      "poNumber",
      "scheduledDate",
      "scheduledTimeSlot",
      "quantityOrdered",
      "vehicleType",
      "licensePlate",
      "driverName",
      "unloadingMethod",
      "destinationZone",
      "deliveryReceipt",
      "unitPrice",
    ].every((field) => Boolean((formValues as Record<string, unknown>)[field]));

    const materialsValid =
      formValues.materials.length > 0 &&
      formValues.materials.every(
        (entry) =>
          entry.materialCategory &&
          entry.materialName &&
          entry.specification &&
          entry.unitOfMeasure &&
          entry.packingType &&
          entry.qualityCertificateAttached
      );

    return generalFieldsFilled && materialsValid;
  }, [formValues]);

  const totalOrderValue = useMemo(() => {
    const qty = Number(formValues.quantityOrdered);
    const price = Number(formValues.unitPrice);
    if (!Number.isFinite(qty) || !Number.isFinite(price)) {
      return "—";
    }
    return (qty * price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [formValues.quantityOrdered, formValues.unitPrice]);

  const handleChange =
    (field: keyof SupplierLogisticsFormValues) => (value: string) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleMaterialChange =
    <K extends keyof MaterialSpecificationEntry>(index: number, field: K) =>
    (value: MaterialSpecificationEntry[K]) => {
      setFormValues((prev) => ({
        ...prev,
        materials: prev.materials.map((entry, idx) =>
          idx === index ? { ...entry, [field]: value } : entry
        ),
      }));
    };

  const addMaterialEntry = () => {
    setFormValues((prev) => ({
      ...prev,
      materials: [...prev.materials, buildMaterialEntry()],
    }));
  };

  const removeMaterialEntry = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting || disabled) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await onSubmit?.(formValues);
      setFeedback("Supplier logistics profile saved.");
      setFormValues(createInitialFormValues());
    } catch (error) {
      console.error("Failed to save supplier logistics form", error);
      setFeedback(
        error instanceof Error ? error.message : "Unable to save form."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800/60 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300">
          Supplier Logistics Form {projectName ? `for ${projectName}` : ""}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Capture key supplier, product, and delivery details required by the
          Construction Verde logistics team.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={disabled || isSubmitting} className="space-y-8">
            {/* Section 1 */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                1. Product and Material Specifications
              </h3>
              <div className="space-y-4">
                {formValues.materials.map((material, index) => (
                  <div
                    key={material.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Material #{index + 1}
                      </h4>
                      {formValues.materials.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeMaterialEntry(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Material / Product Name *</Label>
                        <Input
                          value={material.materialName}
                          onChange={(event) =>
                            handleMaterialChange(
                              index,
                              "materialName"
                            )(event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Specification / Model No. *</Label>
                        <Input
                          value={material.specification}
                          onChange={(event) =>
                            handleMaterialChange(
                              index,
                              "specification"
                            )(event.target.value)
                          }
                          placeholder="e.g., Grade 40, ASTM C150"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit of Measure (UoM) *</Label>
                        <Select
                          value={material.unitOfMeasure}
                          onValueChange={(value) =>
                            handleMaterialChange(index, "unitOfMeasure")(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Packing Type / Size *</Label>
                        <Input
                          value={material.packingType}
                          onChange={(event) =>
                            handleMaterialChange(
                              index,
                              "packingType"
                            )(event.target.value)
                          }
                          placeholder="e.g., 50 kg bag"
                        />
                      </div>
                      <div className="flex items-start gap-3 md:col-span-2">
                        <Checkbox
                          id={`qualityCertificates-${material.id}`}
                          checked={material.qualityCertificateAttached}
                          onCheckedChange={(checked) =>
                            handleMaterialChange(
                              index,
                              "qualityCertificateAttached"
                            )(Boolean(checked))
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor={`qualityCertificates-${material.id}`}>
                            Quality Certificate Attached? *
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Confirms MTCs or other quality documents are
                            available.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Storage Requirements (Optional)</Label>
                        <Textarea
                          value={material.storageRequirements}
                          onChange={(event) =>
                            handleMaterialChange(
                              index,
                              "storageRequirements"
                            )(event.target.value)
                          }
                          placeholder="Specific instructions (e.g., keep dry)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMaterialEntry}
                >
                  Add Another Material
                </Button>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                2. Daily Order and Quantity Tracking
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Order / PO Number *</Label>
                  <Input
                    value={formValues.poNumber}
                    onChange={(event) =>
                      handleChange("poNumber")(event.target.value)
                    }
                    placeholder="PO-2025-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scheduled Delivery Date *</Label>
                  <Input
                    type="date"
                    value={formValues.scheduledDate}
                    onChange={(event) =>
                      handleChange("scheduledDate")(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scheduled Delivery Time Slot *</Label>
                  <Input
                    value={formValues.scheduledTimeSlot}
                    onChange={(event) =>
                      handleChange("scheduledTimeSlot")(event.target.value)
                    }
                    placeholder="e.g., 8:00 AM - 10:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity Ordered (for this delivery) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formValues.quantityOrdered}
                    onChange={(event) =>
                      handleChange("quantityOrdered")(event.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                3. Logistics and Delivery Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Delivery Vehicle Type *</Label>
                  <Select
                    value={formValues.vehicleType}
                    onValueChange={(value) =>
                      handleChange("vehicleType")(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle License Plate No. *</Label>
                  <Input
                    value={formValues.licensePlate}
                    onChange={(event) =>
                      handleChange("licensePlate")(event.target.value)
                    }
                    placeholder="ABC-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Driver Name *</Label>
                  <Input
                    value={formValues.driverName}
                    onChange={(event) =>
                      handleChange("driverName")(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unloading Method *</Label>
                  <Select
                    value={formValues.unloadingMethod}
                    onValueChange={(value) =>
                      handleChange("unloadingMethod")(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {unloadingMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination / Drop-off Zone on Site *</Label>
                  <Select
                    value={formValues.destinationZone}
                    onValueChange={(value) =>
                      handleChange("destinationZone")(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationZones.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Receipt / Waybill No. *</Label>
                  <Input
                    value={formValues.deliveryReceipt}
                    onChange={(event) =>
                      handleChange("deliveryReceipt")(event.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                4. Financials and Cost Tracking
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Unit Price (as per PO) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formValues.unitPrice}
                    onChange={(event) =>
                      handleChange("unitPrice")(event.target.value)
                    }
                    placeholder="e.g., 1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Daily Order Value</Label>
                  <Input value={totalOrderValue} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select
                    value={formValues.paymentTerms}
                    onValueChange={(value) =>
                      handleChange("paymentTerms")(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTermsOptions.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {disabled
                  ? disabledReason ?? "Form is disabled."
                  : "Fields marked with * are required."}
              </div>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting || disabled}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Logistics Plan"}
              </Button>
            </div>
            {feedback && (
              <p className="text-sm text-muted-foreground">{feedback}</p>
            )}
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}

export default SupplierLogisticsForm;
