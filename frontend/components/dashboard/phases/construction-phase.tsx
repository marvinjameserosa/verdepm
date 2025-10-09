import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const constructionData = {
  title: "Construction Phase",
  description: "Daily monitoring of environmental and social metrics",
  dailyTracking: [
    "Fuel consumption (liters/day)",
    "Electricity usage (kWh/day)",
    "Water consumption (m³/day)",
    "Equipment usage (hours/day)",
    "Waste generated (kg/day)",
    "Safety incidents reported",
  ],
  realTimeAnalytics: [
    "Carbon emission calulations",
    "Worker safety compliance rate",
    "Resource efficiency trends",
    "Waste reduction progress",
  ],
};

export default function ConstructionPhase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{constructionData.title}</CardTitle>
        <CardDescription>{constructionData.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Daily Tracking</h3>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            {constructionData.dailyTracking.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Real-Time Analytics</h3>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            {constructionData.realTimeAnalytics.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
