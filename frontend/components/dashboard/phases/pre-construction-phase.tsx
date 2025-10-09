import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const preConstructionData = {
  title: "Pre-Construction Phase",
  description: "Establish baseline ESG targets and initial assessments",
  keyInputs: [
    "Project name and site location",
    "Initial ESG target goals",
    "Material sourcing list",
    "Projected energy/fuel requirements",
    "Pre-assessment checklist",
  ],
  deliverables: [
    "Baseline sustainability report",
    "Risk assessment documentation",
    "Supplier certification verification",
    "Environmental impact forecast",
  ],
};

export default function PreConstructionPhase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{preConstructionData.title}</CardTitle>
        <CardDescription>{preConstructionData.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Key Inputs</h3>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            {preConstructionData.keyInputs.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Deliverables</h3>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            {preConstructionData.deliverables.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
