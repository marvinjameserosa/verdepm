import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function embedText(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

export async function generateReport(knowledge: string) {
  // Use the recommended Gemini 2.5 Pro Preview model for higher quota limits
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-03-25",
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      maxOutputTokens: 8192,
    },
  });

  const prompt = `
Generate a comprehensive Environmental ESG Report for the project using all available construction logs, material logs, delivery logs, equipment records, utility data, and project documents. Use the emissions, resource consumption, and safety data reflected in the dashboard metrics when available. Please use plain text, no markup and no decorators. The final report must be written in a formal and structured manner consistent with standard ESG documentation and suitable for inclusion in an official report.

The ESG report must include detailed narrative analysis and interpretation of the following categories:

Total emissions including the combined emissions value and carbon intensity. Break down emissions by scope including Scope 1 direct emissions from equipment and fuel, Scope 2 indirect emissions from electricity, and Scope 3 value chain emissions including waste and logistics. Use the values and distributions shown in the dashboard and provide interpretation of trend behavior.

Emissions trend analysis including monthly and cumulative emissions trends, deviation from predictive trend lines, scope-specific growth patterns, and overall project progression relative to projected benchmarks.

Emissions scope distribution including proportional contributions of each emissions scope and an explanation of what is driving the largest components. Include interpretation based on the bar chart and numerical values.

Emissions source breakdown including equipment emissions, electricity emissions, and logistics emissions. Provide interpretation on which source is the highest contributor and explain the causes using the displayed metrics.

Project emissions breakdown including emissions per project or per work package as shown in the dashboard. Provide insights into which project components contribute the most to total emissions and why.

Resource and equipment metrics including totals for resource consumption such as electricity, water, and fuel, as well as equipment usage or operational hours. Reference the specific consumption values visible in the dashboard.

Safety index including the number of total recorded incidents. Discuss any patterns or risks that may correlate with resource usage or operational phases.

Water, fuel, and electricity usage including analysis of consumption levels, operational drivers, efficiency concerns, and comparison to industry norms where applicable.

Waste generation and diversion performance including total waste produced, value chain emissions from waste, and any evidence of recycling or diversion. Use available values from Scope 3 and waste-related indicators.

Material sourcing and delivery including supplier activity, sustainability characteristics, logistics fuel consumption, travel distances, and emissions from deliveries. Summarize any insights available in the logs and relate them to Scope 3 emissions.

Carbon footprint comparison including cumulative totals, predictive trend lines, year over year emissions comparison, and benchmarking with similar construction project profiles.

ESG goal tracking including progress toward emissions reduction goals, energy efficiency goals, waste management targets, and safety KPIs. Summarize key KPIs clearly and include their current status.

Compliance insights including alignment with environmental regulations, permit obligations, reporting requirements, and potential areas for noncompliance risk based on observed data.

Delivery partners including identification of top logistics and supplier partners, their performance, strengths, reliability, and areas where improvement is recommended such as emissions reduction, data transparency, or delivery optimization.

Ensure the final report is written as a formal document, uses structured section headings, includes interpretation of all numerical values, and avoids any unnecessary symbols or stylistic elements. The output must resemble a professionally written ESG Environment Report consistent with the style of the previous PDF report.

Data:
${knowledge}
`;

  try {
    const out = await model.generateContent(prompt);
    return out.response.text();
  } catch (error: unknown) {
    console.error("Error generating AI report:", error);

    // Handle quota exceeded errors
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 429
    ) {
      throw new Error(
        "AI service quota exceeded. Please try again later or contact support."
      );
    }

    // Handle other API errors
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number" &&
      error.status >= 400 &&
      error.status < 500
    ) {
      throw new Error(
        "AI service configuration error. Please contact support."
      );
    }

    // Handle network or other errors
    throw new Error(
      "Failed to generate AI report. Please check your connection and try again."
    );
  }
}
