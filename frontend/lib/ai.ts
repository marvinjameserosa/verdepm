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
You are an ESG auditor. Using the data below from construction logs, material logs, and project files, generate a comprehensive ENVIRONMENT ESG report for the project. Include:

- Fuel, electricity, water usage
- Waste generation & diversion
- Equipment efficiency
- Safety incidents
- Material sourcing & delivery
- Carbon footprint comparison
- ESG Goal tracking & KPI summary
- Compliance insights
- Top delivery partners, strengths & areas for improvement

Data:
${knowledge}
`;

  try {
    const out = await model.generateContent(prompt);
    return out.response.text();
  } catch (error: unknown) {
    console.error("Error generating AI report:", error);
    
    // Handle quota exceeded errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      throw new Error("AI service quota exceeded. Please try again later or contact support.");
    }
    
    // Handle other API errors
    if (error && typeof error === 'object' && 'status' in error && 
        typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
      throw new Error("AI service configuration error. Please contact support.");
    }
    
    // Handle network or other errors
    throw new Error("Failed to generate AI report. Please check your connection and try again.");
  }
}
