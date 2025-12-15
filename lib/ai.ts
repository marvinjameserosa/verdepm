import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_GENERATION_MODEL = process.env.GEMINI_GENERATION_MODEL;

let cachedGenAI: GoogleGenerativeAI | null = null;

function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}

function getGenAI(): GoogleGenerativeAI {
  if (cachedGenAI) return cachedGenAI;

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "AI service configuration error: missing Gemini API key. Set GEMINI_API_KEY (or GOOGLE_GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY) and restart the server."
    );
  }

  cachedGenAI = new GoogleGenerativeAI(apiKey);
  return cachedGenAI;
}

function handleGeminiError(error: unknown, context: string): never {
  console.error(`Error generating ${context}:`, error);

  const status =
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status?: number }).status === 429
  ) {
    throw new Error(
      "AI service quota exceeded. Please try again later or contact support."
    );
  }

  if (status === 401 || status === 403) {
    throw new Error(
      "AI service configuration error: Gemini API key is invalid or unauthorized. Verify GEMINI_API_KEY and that the key has access to the selected model."
    );
  }

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status?: number }).status === "number" &&
    (error as { status?: number }).status! >= 400 &&
    (error as { status?: number }).status! < 500
  ) {
    throw new Error(
      "AI service configuration error. Verify your Gemini API key and model configuration."
    );
  }

  throw new Error(
    `Failed to generate ${context}. Please check your connection and try again.`
  );
}

export async function embedText(text: string) {
  try {
    const model = getGenAI().getGenerativeModel({ model: "text-embedding-004" });
    const res = await model.embedContent(text);
    return res.embedding.values;
  } catch (error: unknown) {
    handleGeminiError(error, "embeddings");
  }
}

async function generateWithFallbackModels(options: {
  context: string;
  prompt: string;
  generationConfig: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
  };
}): Promise<string> {
  const candidates = [
    GEMINI_GENERATION_MODEL,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
  ].filter((value): value is string => Boolean(value));

  const tried = new Set<string>();
  const modelsToTry = candidates.filter((model) => {
    if (tried.has(model)) return false;
    tried.add(model);
    return true;
  });

  let lastError: unknown;
  for (const modelName of modelsToTry) {
    try {
      const model = getGenAI().getGenerativeModel({
        model: modelName,
        generationConfig: options.generationConfig,
      });

      const out = await model.generateContent(options.prompt);
      return out.response.text();
    } catch (error: unknown) {
      lastError = error;

      const status =
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? (error as { status: number }).status
          : undefined;

      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "";

      const modelLikelyIssue =
        status === 404 ||
        /model/i.test(message) ||
        /not\s*found/i.test(message) ||
        /does\s*not\s*exist/i.test(message);

      if (modelLikelyIssue) {
        continue;
      }

      handleGeminiError(error, options.context);
    }
  }

  handleGeminiError(lastError, options.context);
}

export async function generateReport(knowledge: string) {
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
    return await generateWithFallbackModels({
      context: "AI report",
      prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    });
  } catch (error: unknown) {
    handleGeminiError(error, "AI report");
  }
}

export async function generateScopeEmissionsInsights(knowledge: string) {
  const prompt = `
You are a sustainability analyst specializing in Scope 1, Scope 2, and Scope 3 emissions for large construction projects. Using only the structured data provided, craft a concise narrative (3-4 short paragraphs) that covers:

If a project name is provided in the data, refer to the project by that name. Do not mention any internal IDs, UUIDs, or "Project ID" values.

1. Current performance for each scope, highlighting which scope drives the largest share of emissions and any notable month-over-month shifts.
2. Alignment against project targets, calling out where actuals are trending above or below the defined thresholds.
3. Specific corrective or acceleration actions that the project team should take in the next reporting cycle. Mention equipment, grid power, logistics, or supplier levers where relevant.

Keep the tone professional, avoid markdown or lists, and reference concrete numbers when available. Do not invent data outside of what is provided.

Data:
${knowledge}
`;

  try {
    return await generateWithFallbackModels({
      context: "scope emissions insight",
      prompt,
      generationConfig: {
        temperature: 0.35,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    });
  } catch (error: unknown) {
    handleGeminiError(error, "scope emissions insight");
  }
}
