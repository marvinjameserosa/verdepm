import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const postConstructionData = {
  title: "Post-Construction Phase",
  description: "Final assessments and comprehensive reporting",
  finalMetrics: [
    "Summary of achieved ESG goals",
    "Environmental compliance score",
    "Final carbon footprint",
    "Waste disposal summary",
    "Post-audit remarks",
  ],
  documentation: [
    "GRI-aligned PDF reports",
    "Certification documentation",
    "Lessons learned summary",
    "Stakeholder presentations",
  ],
};

export default function PostConstructionPhase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{postConstructionData.title}</CardTitle>
        <CardDescription>
          {postConstructionData.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Final Metrics</h3>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            {postConstructionData.finalMetrics.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Documentation</h3>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            {postConstructionData.documentation.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}