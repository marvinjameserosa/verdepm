"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Circle,
  CircleDot,
  PlusCircle,
  ClipboardList,
  Target,
  Layers,
  Search, // New Icon
  Upload, // New Icon
} from "lucide-react";

interface Material {
  id: number;
  name: string;
  supplier: string;
  cost: string;
  credentials: string;
  notes: string;
  status: string;
  unit?: string;
}

// --- PRE-ASSESSMENT GUIDE & OTHER SECTIONS (No changes, included for context) ---

function PreAssessmentChecklistGuide() {
  const assessmentSteps = [
    {
      name: "Project Setup & Due Diligence",
      description: "Define the project and conduct initial research.",
      status: "Active",
    },
    {
      name: "Impact Assessment",
      description: "Analyze findings to forecast ESG risks.",
      status: "Pending",
    },
    {
      name: "Target Setting",
      description: "Set specific goals based on the assessment.",
      status: "Pending",
    },
    {
      name: "Sourcing & Final Review",
      description: "Develop a strategy and prepare for approval.",
      status: "Pending",
    },
  ];
  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "Completed")
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (status === "Active")
      return <CircleDot className="h-6 w-6 text-blue-500" />;
    return <Circle className="h-6 w-6 text-gray-400" />;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-Assessment Progress</CardTitle>
        <CardDescription>
          A visual guide to the pre-construction workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-8">
            {assessmentSteps.map((step) => (
              <div key={step.name} className="flex items-start space-x-6">
                <div className="flex-shrink-0 z-10 bg-background">
                  <StatusIcon status={step.status} />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      step.status === "Active" ? "text-blue-600" : ""
                    }`}
                  >
                    {step.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- MAIN WORKFLOW COMPONENT ---

export default function PreConstructionPhase() {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: 1,
      name: "Cross-Laminated Timber (CLT)",
      supplier: "KLH Massivholz",
      cost: "150000",
      credentials: "FSC Certified, EPD Available",
      notes:
        "Vetted for low transport distance and sustainable forestry practices.",
      status: "Approved",
    },
  ]);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});

  const handleAddMaterial = () => {
    if (!newMaterial.name) {
      alert("Please provide a material name.");
      return;
    }
    setMaterials([
      ...materials,
      { ...newMaterial, id: Date.now() } as Material,
    ]);
    setNewMaterial({});
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PreAssessmentChecklistGuide />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* --- Section 1 & 2 (No changes) --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Step 1: Project Setup & Due Diligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="e.g., 'Greenwood Tower'"
                  defaultValue="Greenwood Tower"
                />
              </div>
              <div className="space-y-2">
                <Label>Project Address</Label>
                <Input
                  placeholder="e.g., '123 Sustainable Ave, Eco City'"
                  defaultValue="123 Sustainable Ave, Eco City"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project Description</Label>
              <Textarea
                placeholder="Briefly describe the project's scope and objectives."
                defaultValue="A 15-story mixed-use building aiming for LEED Platinum certification. Focus on sustainable materials and low operational carbon."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Upload className="mr-2 h-4 w-4" /> Upload Key Documents
              </Label>
              <Input
                type="file"
                multiple
                placeholder="Architectural plans, site surveys, etc."
              />
              <p className="text-xs text-muted-foreground">
                Upload architectural plans, site surveys, and initial permits.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Step 2: Impact Assessment & Target Setting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Define ESG Targets</h4>
              <div className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Environmental">
                          Environmental
                        </SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Goal</Label>
                    <Input placeholder="e.g., Reduce Embodied Carbon" />
                  </div>
                  <div className="space-y-2">
                    <Label>Metric / KPI</Label>
                    <Input placeholder="e.g., < 500 kgCO2e/m²" />
                  </div>
                </div>
                <Button className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Target
                </Button>
              </div>
            </div>
            <div className="mt-6">
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
          </CardContent>
        </Card>

        {/* --- Section 3: OVERHAULED MATERIAL SOURCING --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-6 w-6" />
              Step 3: Material Sourcing & Due Diligence
            </CardTitle>
            <CardDescription>
              Plan and vet your material supply chain. This creates the baseline
              for comparison during and after construction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-semibold flex items-center">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Material to Sourcing Plan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Material Name</Label>
                  <Input
                    placeholder="e.g., Cross-Laminated Timber"
                    value={newMaterial.name || ""}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Planned Supplier</Label>
                  <Input
                    placeholder="e.g., KLH Massivholz"
                    value={newMaterial.supplier || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        supplier: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budgeted Cost ($) & Unit</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="150000"
                      value={newMaterial.cost || ""}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, cost: e.target.value })
                      }
                    />
                    <Input
                      placeholder="per Lot"
                      value={newMaterial.unit || ""}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, unit: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sustainability Credentials</Label>
                  <Input
                    placeholder="e.g., FSC Certified, EPD Available"
                    value={newMaterial.credentials || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        credentials: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Search className="mr-2 h-4 w-4" /> Supplier Vetting Notes
                </Label>
                <Textarea
                  placeholder="Document your due diligence here. Why this supplier? ESG score? Transport distance?"
                  value={newMaterial.notes || ""}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, notes: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" /> Upload Spec Sheet/EPD
                  </Label>
                  <Input type="file" />
                </div>
                <div className="space-y-2">
                  <Label>Vetting Status</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewMaterial({ ...newMaterial, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Set Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Identified">Identified</SelectItem>
                      <SelectItem value="Vetted">Vetted</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddMaterial} className="w-full md:w-auto">
                Add to Sourcing Plan
              </Button>
            </div>

            <div className="mt-6">
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
                          ${parseFloat(mat.cost).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              mat.status === "Approved"
                                ? "default"
                                : mat.status === "Vetted"
                                ? "secondary"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
