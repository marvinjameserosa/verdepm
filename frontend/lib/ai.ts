import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function embedText(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

export async function generateReport(knowledge: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp" });
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

  const out = await model.generateContent(prompt);
  return out.response.text();
}
