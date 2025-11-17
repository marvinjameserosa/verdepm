import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { embedText, generateReport } from "@/lib/ai";
import { chunkText } from "@/lib/chunker";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";

export async function POST(req: Request) {
  const { projectId } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let allContent = "";
  const { data: files } = await supabase.storage.from("esg-files").list("");
  for (const f of files || []) {
    const { data: fileBlob } = await supabase.storage.from("esg-files").download(f.name);
    if (!fileBlob) continue;
    const rawText = await fileBlob.text();
    allContent += `\n\n---FILE: ${f.name}---\n${rawText}`;
  }

  const { data: dailyLogs } = await supabase
    .from("construction_daily_log")
    .select("*")
    .eq("project_id", projectId);

  let totalFuel = 0,
      totalElectricity = 0,
      totalWater = 0,
      totalEquipmentHours = 0,
      totalWaste = 0,
      totalSafetyIncidents = 0;

  if (dailyLogs) {
    dailyLogs.forEach(d => {
      totalFuel += d.fuel_consumption_liters || 0;
      totalElectricity += d.electricity_usage_kwh || 0;
      totalWater += d.water_consumption_cubic_m || 0;
      totalEquipmentHours += d.equipment_usage_hours || 0;
      totalWaste += d.todays_waste_generated_kg || 0;
      totalSafetyIncidents += d.safety_incidents || 0;
    });

    allContent += "\n\n---Daily Logs---\n" +
      dailyLogs.map(d =>
        `Date: ${d.log_date}\nFuel: ${d.fuel_consumption_liters}\nElectricity: ${d.electricity_usage_kwh}\nWater: ${d.water_consumption_cubic_m}\nEquipment Hours: ${d.equipment_usage_hours}\nWaste: ${d.todays_waste_generated_kg}\nSafety Incidents: ${d.safety_incidents}\nNotes: ${d.notes}`
      ).join("\n\n");
  }

  const { data: materialLogs } = await supabase
    .from("construction_material_log")
    .select("*")
    .eq("project_id", projectId);

  let materialSpend = 0, materialDeliveries = 0, totalDeliveryFuel = 0;
  const supplierMap: Record<string, { count: number; spend: number; fuelUsed: number }> = {};

  if (materialLogs) {
    materialDeliveries = materialLogs.length;
    for (const m of materialLogs) {
      materialSpend += m.total_cost || 0;
      totalDeliveryFuel += m.delivery_fuel_used_liters || 0;
      if (!supplierMap[m.actual_supplier]) supplierMap[m.actual_supplier] = { count: 0, spend: 0, fuelUsed: 0 };
      supplierMap[m.actual_supplier].count += 1;
      supplierMap[m.actual_supplier].spend += m.total_cost || 0;
      supplierMap[m.actual_supplier].fuelUsed += m.delivery_fuel_used_liters || 0;
    }
    allContent += "\n\n---Material Logs---\n" +
      materialLogs.map(m =>
        `Material Plan: ${m.material_plan}\nSupplier: ${m.actual_supplier}\nQuantity & Unit: ${m.quantity_and_unit}\nTotal Cost: ${m.total_cost}\nDelivery Fuel Used: ${m.delivery_fuel_used_liters}\nReceipt Path: ${m.receipt_path}`
      ).join("\n\n");
  }

  const esgReportText = await generateReport(allContent);

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 12;
  let y = height - 50;

  const drawText = (text: string, options?: { font?: any; size?: number; color?: any; x?: number; y?: number }) => {
    page.drawText(text, { x: options?.x || 50, y: options?.y ?? y, size: options?.size || fontSize, font: options?.font || font, color: options?.color || rgb(0, 0, 0) });
    y -= (options?.size || fontSize) + 5;
    if (y < 50) { page = pdfDoc.addPage(); y = height - 50; }
  };

  drawText(`ESG Environment Report`, { font: fontBold, size: 18, color: rgb(0, 0.3, 0.6) });
  drawText(`Project: ${projectId}`, { font: fontBold, size: 14 });
  drawText(`Generated: ${new Date().toLocaleString()}`);
  y -= 10;

  drawText("Key Metrics & Performance Summary", { font: fontBold, size: 14, color: rgb(0,0.5,0) });
  const metrics = [
    ["Metric", "Value"],
    ["tCO₂e below plan", "0%"],
    ["Water efficiency", "0%"],
    ["Waste diversion", "0%"],
    ["Fuel Used", `${totalFuel} liters`],
    ["Electricity Used", `${totalElectricity} kWh`],
    ["Material Deliveries", `${materialDeliveries} records`],
    ["Material Spend", `$${materialSpend.toLocaleString()}`],
    ["Total delivery fuel used", `${totalDeliveryFuel.toLocaleString()} liters`]
  ];

  const tableX = 50;
  let tableY = y;
  const colWidths = [200, 150];
  const rowHeight = 20;
  metrics.forEach((row, i) => {
    const bgColor = i === 0 ? rgb(0.8,0.8,0.8) : i%2===0 ? rgb(0.95,0.95,0.95) : rgb(1,1,1);
    page.drawRectangle({ x: tableX-5, y: tableY-rowHeight+5, width: colWidths[0]+colWidths[1]+10, height: rowHeight, color: bgColor });
    page.drawText(row[0], { x: tableX, y: tableY, size: fontSize, font: i===0 ? fontBold : font, color: rgb(0,0,0) });
    page.drawText(row[1], { x: tableX + colWidths[0], y: tableY, size: fontSize, font: i===0 ? fontBold : font, color: rgb(0,0,0) });
    tableY -= rowHeight;
  });
  y = tableY - 30;

  // Section: Top Suppliers
  drawText("Top Delivery Partners", { font: fontBold, size: 14, color: rgb(0,0.3,0.3) });
  Object.keys(supplierMap).forEach(s => {
    const info = supplierMap[s];
    drawText(`${s}: ${info.count} deliveries • $${info.spend.toLocaleString()} • ${info.fuelUsed.toLocaleString()} L fuel`);
  });
  y -= 20;

  drawText("ESG Narrative & Compliance Insights", { font: fontBold, size: 14, color: rgb(0.4,0,0.6) });
  const chunks = chunkText(esgReportText, 100);
  for (const c of chunks) {
    drawText(c);
    y -= 5;
  }

  const pdfBytes = await pdfDoc.save();
  const fileName = `ESG_Report_${projectId}_${new Date().toISOString()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("esg-reports")
    .upload(fileName, pdfBytes, { contentType: "application/pdf" });

  if (uploadError) return NextResponse.json({ error: uploadError }, { status: 500 });

  await supabase.from("esg_report_metadata").insert({
    project_id: projectId,
    filename: fileName,
    description: "ESG Environment Report with charts, tables, and compliance insights"
  });

  return NextResponse.json({ pdfFileName: fileName });
}
