import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateReport } from "@/lib/ai";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import {
  EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER as EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER_CONST,
} from "@/types/construction";

const normalizeNumericValue = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatCurrencyPHP = (value: number): string => {
  return `PHP ${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
};

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: projectRecord,
      error: projectError,
    } = await supabase
      .from("projects")
      .select("project_name")
      .eq("project_id", projectId)
      .maybeSingle();

    if (projectError) {
      throw projectError;
    }

    if (!projectRecord) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    let allContent = "";
    const { data: files } = await supabase.storage.from("esg-files").list("");

    if (files) {
      for (const file of files) {
        const { data: fileBlob } = await supabase.storage
          .from("esg-files")
          .download(file.name);
        if (fileBlob) {
          const rawText = await fileBlob.text();
          allContent += `\n\n---FILE: ${file.name}---\n${rawText}`;
        }
      }
    }

    const [dailyLogsResponse, monthlyLogsResponse, materialResponse] =
      await Promise.all([
        supabase
          .from("daily_logs")
          .select(
            "timestamp, equipment_fuel_consumed, number_of_incidents"
          )
          .eq("project_id", projectId),
        supabase
          .from("monthly_logs")
          .select(
            "timestamp, electricity_consumption, water_consumption, total_waste_mass"
          )
          .eq("project_id", projectId),
        supabase
          .from("material")
          .select("id, material_name, supplier, estimated_cost")
          .eq("project_id", projectId),
      ]);

    if (dailyLogsResponse.error) throw dailyLogsResponse.error;
    if (monthlyLogsResponse.error) throw monthlyLogsResponse.error;
    if (materialResponse.error) throw materialResponse.error;

    const dailyLogs = dailyLogsResponse.data ?? [];
    const monthlyLogs = monthlyLogsResponse.data ?? [];
    const materialRecords = materialResponse.data ?? [];

    const totalFuelUsed = dailyLogs.reduce((sum, log) => {
      return sum + normalizeNumericValue(log.equipment_fuel_consumed);
    }, 0);

    const incidentValues = dailyLogs
      .map((log) => {
        if (
          log.number_of_incidents === null ||
          log.number_of_incidents === undefined
        ) {
          return null;
        }
        return normalizeNumericValue(log.number_of_incidents);
      })
      .filter((value): value is number => value !== null);

    const averageSafetyTrir =
      incidentValues.length > 0
        ? incidentValues.reduce((acc, value) => acc + value, 0) /
          incidentValues.length
        : null;

    const totalSafetyIncidents = incidentValues.reduce(
      (acc, value) => acc + value,
      0
    );

    const totalElectricityConsumption = monthlyLogs.reduce((sum, log) => {
      return sum + normalizeNumericValue(log.electricity_consumption);
    }, 0);

    const totalWater = monthlyLogs.reduce((sum, log) => {
      return sum + normalizeNumericValue(log.water_consumption);
    }, 0);

    const totalWaste = monthlyLogs.reduce((sum, log) => {
      return sum + normalizeNumericValue(log.total_waste_mass);
    }, 0);

    const materialDeliveries = materialRecords.length;

    const materialSpend = materialRecords.reduce((sum, record) => {
      return sum + normalizeNumericValue(record.estimated_cost);
    }, 0);

    const totalEquipmentEmissionsKg =
      totalFuelUsed * EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER_CONST;

    const supplierMap: Record<string, { count: number; spend: number }> = {};
    materialRecords.forEach((record) => {
      const supplierName = record.supplier || "Unknown Supplier";
      if (!supplierMap[supplierName]) {
        supplierMap[supplierName] = { count: 0, spend: 0 };
      }
      supplierMap[supplierName].count += 1;
      supplierMap[supplierName].spend += normalizeNumericValue(
        record.estimated_cost
      );
    });

    if (dailyLogs.length > 0) {
      allContent +=
        "\n\n---Daily Logs---\n" +
        dailyLogs
          .map((log) => {
            const fuel = normalizeNumericValue(log.equipment_fuel_consumed);
            const incidents =
              log.number_of_incidents === null ||
              log.number_of_incidents === undefined
                ? "N/A"
                : normalizeNumericValue(log.number_of_incidents);
            return `Date: ${log.timestamp}\nFuel Used: ${fuel}\nSafety Incidents: ${incidents}`;
          })
          .join("\n\n");
    }

    if (monthlyLogs.length > 0) {
      allContent +=
        "\n\n---Monthly Resource Logs---\n" +
        monthlyLogs
          .map((log) => {
            const electricity = normalizeNumericValue(
              log.electricity_consumption
            );
            const water = normalizeNumericValue(log.water_consumption);
            const waste = normalizeNumericValue(log.total_waste_mass);
            return `Date: ${log.timestamp}\nElectricity Consumption: ${electricity}\nWater Consumption: ${water}\nTotal Waste Mass: ${waste}`;
          })
          .join("\n\n");
    }

    if (materialRecords.length > 0) {
      allContent +=
        "\n\n---Material Records---\n" +
        materialRecords
          .map((record) => {
            const spend = normalizeNumericValue(record.estimated_cost);
            return `Material: ${record.material_name ?? "N/A"}\nSupplier: ${
              record.supplier ?? "Unknown Supplier"
            }\nCost: ${formatCurrencyPHP(spend)}`;
          })
          .join("\n\n");
    }

    allContent += `\n\n---SUMMARY METRICS---
- Project Name: ${projectRecord.project_name ?? projectId}
- Total Fuel Used: ${totalFuelUsed.toFixed(2)} liters
- Electricity Consumption: ${totalElectricityConsumption.toFixed(2)} kWh
- Average Safety TRIR: ${
      averageSafetyTrir !== null ? averageSafetyTrir.toFixed(2) : "N/A"
    }
- Total Safety Incidents: ${totalSafetyIncidents}
- Material Deliveries: ${materialDeliveries}
- Total Material Spend: ${formatCurrencyPHP(materialSpend)}
- Water Consumption: ${totalWater.toFixed(2)} m3
- Total Waste Generated: ${totalWaste.toFixed(2)} kg`;

    const esgReportText = await generateReport(allContent);

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;
    let y = height - 50;

    const sanitizeTextForPDF = (text: string): string => {
      return text
        .replace(/₂/g, "2")
        .replace(/₃/g, "3")
        .replace(/₁/g, "1")
        .replace(/°/g, " deg")
        .replace(/µ/g, "u")
        .replace(/²/g, "2")
        .replace(/³/g, "3")
        .replace(/[^\x00-\x7F]/g, "?");
    };

    const drawText = (
      text: string,
      options?: {
        font?: typeof font;
        size?: number;
        color?: ReturnType<typeof rgb>;
        x?: number;
        y?: number;
      }
    ) => {
      const sanitizedText = sanitizeTextForPDF(text);
      page.drawText(sanitizedText, {
        x: options?.x || 50,
        y: options?.y ?? y,
        size: options?.size || fontSize,
        font: options?.font || font,
        color: options?.color || rgb(0, 0, 0),
      });
      y -= (options?.size || fontSize) + 5;

      if (y < 50) {
        page = pdfDoc.addPage(PageSizes.A4);
        y = height - 50;
      }
    };

    drawText("ESG Environment Report", { font: fontBold, size: 18 });
    drawText(`Project: ${projectRecord.project_name ?? projectId}`, {
      font: fontBold,
      size: 14,
    });
    drawText(`Generated: ${new Date().toLocaleDateString()}`, { size: 10 });
    y -= 20;

    const metrics = [
      ["Metric", "Value"],
      ["Fuel Used", `${totalFuelUsed.toFixed(2)} liters`],
      [
        "Electricity Consumption",
        `${totalElectricityConsumption.toFixed(2)} kWh`,
      ],
      [
        "Equipment Combustion Emissions",
        `${totalEquipmentEmissionsKg.toFixed(2)} kg CO2e`,
      ],
      [
        "Average Safety TRIR",
        averageSafetyTrir !== null ? averageSafetyTrir.toFixed(2) : "N/A",
      ],
      ["Total Safety Incidents", `${totalSafetyIncidents}`],
      ["Material Deliveries", `${materialDeliveries}`],
      ["Material Spend", formatCurrencyPHP(materialSpend)],
      ["Water Consumption", `${totalWater.toFixed(2)} m3`],
      ["Total Waste Generated", `${totalWaste.toFixed(2)} kg`],
    ];

    drawText("Key Metrics:", { font: fontBold, size: 14 });
    y -= 10;

    const tableX = 50;
    let tableY = y;
    const colWidths = [220, 180];
    const rowHeight = 20;

    metrics.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x =
          tableX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        const cellText = sanitizeTextForPDF(String(cell ?? ""));
        page.drawText(cellText, {
          x,
          y: tableY,
          size: rowIndex === 0 ? 11 : 10,
          font: rowIndex === 0 ? fontBold : font,
        });
      });
      tableY -= rowHeight;
    });

    y = tableY - 20;

    drawText("AI Analysis:", { font: fontBold, size: 14 });

    const lines = esgReportText.split("\n");
    for (const line of lines) {
      if (line.trim()) {
        const words = line.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          if (testLine.length > 70) {
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
        y -= 10;
      }
    }

    if (Object.keys(supplierMap).length > 0) {
      y -= 20;
      drawText("Supplier Summary:", { font: fontBold, size: 14 });

      Object.entries(supplierMap).forEach(([supplierName, info]) => {
        drawText(
          `${supplierName}: ${info.count} deliveries • ${formatCurrencyPHP(
            info.spend
          )}`
        );
      });
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `ESG_Report_${projectId}_${new Date().toISOString()}.pdf`;

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

    await supabase.from("esg_report_metadata").insert({
      project_id: projectId,
      filename: fileName,
      description:
        "ESG Environment Report with charts, tables, and compliance insights",
    });

    return NextResponse.json({ pdfFileName: fileName });
  } catch (error: unknown) {
    console.error("Error generating ESG report:", error);

    if (
      error instanceof Error &&
      error.message?.includes("AI service quota exceeded")
    ) {
      return NextResponse.json(
        {
          error: "AI service quota exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (
      error instanceof Error &&
      error.message?.includes("AI service configuration")
    ) {
      return NextResponse.json(
        {
          error: "AI service configuration error. Please contact support.",
        },
        { status: 503 }
      );
    }

    if (
      error instanceof Error &&
      (error.name === "SupabaseError" || error.message?.includes("supabase"))
    ) {
      return NextResponse.json(
        {
          error: "Database error. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate ESG report. Please try again later.",
      },
      { status: 500 }
    );
  }
}
