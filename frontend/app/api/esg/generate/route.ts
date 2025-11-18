import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateReport } from "@/lib/ai";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Gather content from ESG files
    let allContent = "";
    const { data: files } = await supabase.storage.from("esg-files").list("");
    
    if (files) {
      for (const f of files) {
        const { data: fileBlob } = await supabase.storage.from("esg-files").download(f.name);
        if (fileBlob) {
          const rawText = await fileBlob.text();
          allContent += `\n\n---FILE: ${f.name}---\n${rawText}`;
        }
      }
    }

    // Fetch daily logs
    const { data: dailyLogs } = await supabase
      .from("construction_daily_log")
      .select("*")
      .eq("project_id", projectId);

    // Fetch monthly logs
    const { data: monthlyLogs } = await supabase
      .from("construction_monthly_log")
      .select("*")
      .eq("project_id", projectId);

    // Initialize variables for calculations
    let totalFuel = 0;
    let totalElectricityEmissionsKg = 0;
    let totalWater = 0;
    let totalEquipmentEmissionsKg = 0;
    let totalWaste = 0;
    let safetyTrirSum = 0;
    let safetyEntryCount = 0;

    // Process daily logs
    if (dailyLogs) {
      dailyLogs.forEach((d: any) => {
        totalFuel += d.fuel_consumption_liters || 0;
        totalEquipmentEmissionsKg += d.equipment_usage_tco2e || 0;
        if (typeof d.safety_incidents === "number" && Number.isFinite(d.safety_incidents)) {
          safetyTrirSum += d.safety_incidents;
          safetyEntryCount += 1;
        }
      });

      allContent += "\n\n---Daily Logs---\n" +
        dailyLogs.map((d: any) =>
          `Date: ${d.log_date}\nFuel: ${d.fuel_consumption_liters}\nEquipment CO₂e (kg): ${d.equipment_usage_tco2e}\nSafety TRIR: ${d.safety_incidents}\nNotes: ${d.notes}`
        ).join("\n\n");
    }

    // Process monthly logs
    if (monthlyLogs) {
      monthlyLogs.forEach((m: any) => {
        totalElectricityEmissionsKg += m.electricity_usage_kwh || 0;
        totalWater += m.water_consumption_cubic_m || 0;
        totalWaste += m.waste_generated_kg || 0;
      });

      allContent += "\n\n---Monthly Resource Logs---\n" +
        monthlyLogs.map((m: any) =>
          `Month: ${m.log_month}\nElectricity (kg CO₂e): ${m.electricity_usage_kwh}\nWater (m³): ${m.water_consumption_cubic_m}\nWaste (kg): ${m.waste_generated_kg}\nSubmitted On: ${m.submitted_on}`
        ).join("\n\n");
    }

    // Fetch material logs
    const { data: materialLogs } = await supabase
      .from("construction_material_log")
      .select("*")
      .eq("project_id", projectId);

    let materialSpend = 0;
    let materialDeliveries = 0;
    let totalDeliveryFuel = 0;
    const supplierMap: Record<string, { count: number; spend: number; fuelUsed: number }> = {};

    if (materialLogs) {
      materialDeliveries = materialLogs.length;
      for (const m of materialLogs) {
        materialSpend += m.total_cost || 0;
        totalDeliveryFuel += m.delivery_fuel_used_liters || 0;
        
        if (!supplierMap[m.actual_supplier]) {
          supplierMap[m.actual_supplier] = { count: 0, spend: 0, fuelUsed: 0 };
        }
        supplierMap[m.actual_supplier].count += 1;
        supplierMap[m.actual_supplier].spend += m.total_cost || 0;
        supplierMap[m.actual_supplier].fuelUsed += m.delivery_fuel_used_liters || 0;
      }

      allContent += "\n\n---Material Logs---\n" +
        materialLogs.map((m: any) =>
          `Material: ${m.material_type}\nQuantity: ${m.quantity_delivered}\nSupplier: ${m.actual_supplier}\nCost: $${m.total_cost}\nDelivery Date: ${m.delivery_date}`
        ).join("\n\n");
    }

    // Calculate averages and totals
    const averageSafetyTrir = safetyEntryCount > 0 ? safetyTrirSum / safetyEntryCount : 0;
    const totalElectricity = totalElectricityEmissionsKg; // Assuming this is the electricity usage
    const totalEquipmentHours = materialDeliveries * 2; // Rough estimate
    const totalSafetyIncidents = safetyTrirSum;

    // Add summary to content
    allContent += `\n\n---SUMMARY METRICS---
- Total Fuel Used: ${totalFuel} liters
- Total Electricity Usage: ${totalElectricity} kWh
- Total Water Usage: ${totalWater} m³
- Total Equipment Hours: ${totalEquipmentHours} hours
- Total Waste Generated: ${totalWaste} kg
- Safety Incidents: ${totalSafetyIncidents}
- Material Deliveries: ${materialDeliveries}
- Total Material Spend: $${materialSpend}
- Total Delivery Fuel: ${totalDeliveryFuel} liters`;

    // Generate AI report
    const esgReportText = await generateReport(allContent);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;
    let y = height - 50;

    const drawText = (text: string, options?: { 
      font?: typeof font; 
      size?: number; 
      color?: ReturnType<typeof rgb>; 
      x?: number; 
      y?: number 
    }) => {
      page.drawText(text, { 
        x: options?.x || 50, 
        y: options?.y ?? y, 
        size: options?.size || fontSize, 
        font: options?.font || font, 
        color: options?.color || rgb(0, 0, 0) 
      });
      y -= (options?.size || fontSize) + 5;
      
      // Add new page if needed
      if (y < 50) {
        page = pdfDoc.addPage(PageSizes.A4);
        y = height - 50;
      }
    };

    // Draw PDF content
    drawText(`ESG Environment Report`, { font: fontBold, size: 18 });
    drawText(`Project: ${projectId}`, { font: fontBold, size: 14 });
    drawText(`Generated: ${new Date().toLocaleDateString()}`, { size: 10 });
    y -= 20;

    // Add metrics table
    const metrics = [
      ["Metric", "Value"],
      ["Fuel Used", `${totalFuel} liters`],
      ["Electricity Emissions", `${totalElectricityEmissionsKg.toFixed(2)} kg CO₂e`],
      ["Equipment Combustion", `${totalEquipmentEmissionsKg.toFixed(2)} kg CO₂e`],
      ["Average Safety TRIR", safetyEntryCount > 0 ? averageSafetyTrir.toFixed(2) : "N/A"],
      ["Material Deliveries", `${materialDeliveries} records`],
      ["Material Spend", `$${materialSpend.toLocaleString()}`],
      ["Total delivery fuel used", `${totalDeliveryFuel.toLocaleString()} liters`]
    ];

    drawText("Key Metrics:", { font: fontBold, size: 14 });
    y -= 10;

    // Draw table
    const tableX = 50;
    let tableY = y;
    const colWidths = [200, 150];
    const rowHeight = 20;

    metrics.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = tableX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        page.drawText(cell, { 
          x, 
          y: tableY, 
          size: rowIndex === 0 ? 11 : 10, 
          font: rowIndex === 0 ? fontBold : font 
        });
      });
      tableY -= rowHeight;
    });

    y = tableY - 20;

    // Add AI-generated content
    drawText("AI Analysis:", { font: fontBold, size: 14 });
    
    // Split long text into lines
    const lines = esgReportText.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        // Handle long lines by wrapping
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          if (testLine.length > 70) { // Approximate character limit per line
            if (currentLine) {
              drawText(currentLine);
            }
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          drawText(currentLine);
        }
      } else {
        y -= 10; // Add spacing for empty lines
      }
    }

    // Add supplier information
    if (Object.keys(supplierMap).length > 0) {
      y -= 20;
      drawText("Supplier Summary:", { font: fontBold, size: 14 });
      
      Object.entries(supplierMap).forEach(([supplierName, info]) => {
        drawText(`${supplierName}: ${info.count} deliveries • $${info.spend.toLocaleString()} • ${info.fuelUsed.toLocaleString()} L fuel`);
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `ESG_Report_${projectId}_${new Date().toISOString()}.pdf`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("esg-reports")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Save metadata
    await supabase.from("esg_report_metadata").insert({
      project_id: projectId,
      filename: fileName,
      description: "ESG Environment Report with charts, tables, and compliance insights"
    });

    return NextResponse.json({ pdfFileName: fileName });

  } catch (error: unknown) {
    console.error("Error generating ESG report:", error);

    // Return specific error messages based on error type
    if (error instanceof Error && error.message?.includes("AI service quota exceeded")) {
      return NextResponse.json({
        error: "AI service quota exceeded. Please try again later."
      }, { status: 429 });
    }

    if (error instanceof Error && error.message?.includes("AI service configuration")) {
      return NextResponse.json({
        error: "AI service configuration error. Please contact support."
      }, { status: 503 });
    }

    if (error instanceof Error && (error.name === 'SupabaseError' || error.message?.includes('supabase'))) {
      return NextResponse.json({
        error: "Database error. Please try again later."
      }, { status: 503 });
    }

    // Generic error for anything else
    return NextResponse.json({
      error: "Failed to generate ESG report. Please try again later."
    }, { status: 500 });
  }
}
