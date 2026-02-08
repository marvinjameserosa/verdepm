import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateReport } from "@/lib/ai";
import { PDFDocument, rgb, StandardFonts, PageSizes, PDFPage } from "pdf-lib";
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

    const formatNumber = (
      value: number,
      options?: Intl.NumberFormatOptions
    ): string => {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options,
      }).format(value);
    };

    const fuelDisplay = `${formatNumber(totalFuelUsed)} liters`;
    const electricityDisplay = `${formatNumber(
      totalElectricityConsumption
    )} kWh`;
    const waterDisplay = `${formatNumber(totalWater)} m3`;
    const wasteDisplay = `${formatNumber(totalWaste)} kg`;
    const emissionsDisplay = `${formatNumber(
      totalEquipmentEmissionsKg
    )} kg CO2e`;
    const safetyTrirDisplay =
      averageSafetyTrir !== null
        ? formatNumber(averageSafetyTrir)
        : "N/A";
    const incidentsDisplay = formatNumber(totalSafetyIncidents, {
      maximumFractionDigits: 0,
    });
    const deliveriesDisplay = formatNumber(materialDeliveries, {
      maximumFractionDigits: 0,
    });

    const summarySentences: string[] = [
      `The ${projectRecord.project_name ?? projectId} project recorded ${fuelDisplay} of fuel use, ${electricityDisplay} of electricity, and ${waterDisplay} of water consumption during the reporting period.`,
      `Equipment combustion resulted in ${emissionsDisplay}, while construction activities generated ${wasteDisplay} of total waste across ${deliveriesDisplay} material deliveries.`,
    ];
    if (averageSafetyTrir !== null) {
      summarySentences.push(
        `Safety performance reflected an average TRIR of ${safetyTrirDisplay} across ${incidentsDisplay} recorded incidents.`
      );
    } else {
      summarySentences.push(
        "Safety incidents were not recorded for this period; confirm logging of hours to enable TRIR calculations."
      );
    }

    const environmentalHighlights = [
      `Equipment fuel consumption totaled ${fuelDisplay}, translating to ${emissionsDisplay}.`,
      `Electrical usage reached ${electricityDisplay} with water demand of ${waterDisplay}.`,
      `Construction activities generated ${wasteDisplay} of waste supported by ${deliveriesDisplay} material deliveries.`,
    ];

    const safetyHighlights =
      averageSafetyTrir !== null
        ? [
            `Average TRIR registered at ${safetyTrirDisplay} with ${incidentsDisplay} incidents logged.`,
            "Continue monitoring workforce exposure hours and near-miss reporting to sustain performance.",
          ]
        : [
            "No TRIR data was captured for the selected period.",
            "Verify daily logs include employee hours to calculate TRIR accurately.",
          ];

    const supplierEntries = Object.entries(supplierMap).sort(
      (a, b) => b[1].spend - a[1].spend
    );
    const uniqueSuppliers = supplierEntries.length;
    const supplierHighlights = supplierEntries.length
      ? [
          `${uniqueSuppliers} active suppliers completed ${deliveriesDisplay} deliveries supporting site activities.`,
          `Top supplier ${supplierEntries[0][0]} managed ${supplierEntries[0][1].count} deliveries totaling ${formatCurrencyPHP(
            supplierEntries[0][1].spend
          )}.`,
        ]
      : ["No supplier deliveries were recorded for the selected period."];

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const HEADER_HEIGHT = 68;
    const FOOTER_HEIGHT = 36;
    const PAGE_MARGIN_X = 50;
    const BODY_FONT_SIZE = 10;
    const SECTION_FONT_SIZE = 14;
    const TITLE_FONT_SIZE = 20;
    const CELL_HORIZONTAL_PADDING = 14;

    const primaryColor = rgb(0.11, 0.45, 0.34);
    const accentColor = rgb(0.17, 0.63, 0.44);
    const borderColor = rgb(0.78, 0.88, 0.83);
    const tableHeaderFill = rgb(0.84, 0.93, 0.89);
    const tableAltFill = rgb(0.96, 0.98, 0.97);
    const textColor = rgb(0.15, 0.18, 0.2);
    const mutedTextColor = rgb(0.43, 0.47, 0.5);

    let currentPage: PDFPage;
    let pageWidth = 0;
    let pageHeight = 0;
    let currentY = 0;
    let pageNumber = 0;

    const generatedDateLabel = new Date().toLocaleDateString();

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

    const drawHeader = (pageRef: PDFPage) => {
      pageRef.drawRectangle({
        x: 0,
        y: pageHeight - HEADER_HEIGHT,
        width: pageWidth,
        height: HEADER_HEIGHT,
        color: primaryColor,
      });
      pageRef.drawText("ESG Performance Report", {
        x: PAGE_MARGIN_X,
        y: pageHeight - HEADER_HEIGHT + 34,
        size: TITLE_FONT_SIZE,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      pageRef.drawText(
        sanitizeTextForPDF(projectRecord.project_name ?? projectId),
        {
          x: PAGE_MARGIN_X,
          y: pageHeight - HEADER_HEIGHT + 16,
          size: 11,
          font,
          color: rgb(0.9, 0.95, 0.92),
        }
      );
      pageRef.drawText("VerdePM ESG Analytics", {
        x: PAGE_MARGIN_X,
        y: pageHeight - HEADER_HEIGHT + 2,
        size: 8,
        font,
        color: rgb(0.85, 0.93, 0.9),
      });
    };

    const drawFooter = (pageRef: PDFPage) => {
      pageRef.drawLine({
        start: { x: PAGE_MARGIN_X, y: FOOTER_HEIGHT },
        end: { x: pageWidth - PAGE_MARGIN_X, y: FOOTER_HEIGHT },
        thickness: 0.6,
        color: borderColor,
      });
      pageRef.drawText("Generated by VerdePM", {
        x: PAGE_MARGIN_X,
        y: FOOTER_HEIGHT - 18,
        size: 9,
        font,
        color: mutedTextColor,
      });
      const footerLabel = `Generated ${generatedDateLabel}  •  Page ${pageNumber}`;
      const footerWidth = font.widthOfTextAtSize(footerLabel, 9);
      pageRef.drawText(footerLabel, {
        x: pageWidth - PAGE_MARGIN_X - footerWidth,
        y: FOOTER_HEIGHT - 18,
        size: 9,
        font,
        color: mutedTextColor,
      });
    };

    const addNewPage = () => {
      pageNumber += 1;
      currentPage = pdfDoc.addPage(PageSizes.A4);
      const size = currentPage.getSize();
      pageWidth = size.width;
      pageHeight = size.height;
      drawHeader(currentPage);
      drawFooter(currentPage);
      currentY = pageHeight - HEADER_HEIGHT - 30;
    };

    const ensureSpace = (required: number) => {
      if (currentY - required < FOOTER_HEIGHT + 24) {
        addNewPage();
      }
    };

    const wrapText = (
      text: string,
      size = BODY_FONT_SIZE,
      fontToUse = font
    ): string[] => {
      const sanitized = sanitizeTextForPDF(text);
      const words = sanitized.split(/\s+/);
      const lines: string[] = [];
      const contentWidth = pageWidth - PAGE_MARGIN_X * 2;
      let currentLine = "";
      for (const word of words) {
        if (!word) continue;
        const tentative = currentLine ? `${currentLine} ${word}` : word;
        const lineWidth = fontToUse.widthOfTextAtSize(tentative, size);
        if (lineWidth > contentWidth) {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
        } else {
          currentLine = tentative;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    const drawParagraph = (text: string, size = BODY_FONT_SIZE) => {
      const lines = wrapText(text, size, font);
      if (lines.length === 0) {
        currentY -= size + 2;
        return;
      }
      ensureSpace(lines.length * (size + 4));
      lines.forEach((line) => {
        currentPage.drawText(line, {
          x: PAGE_MARGIN_X,
          y: currentY,
          size,
          font,
          color: textColor,
        });
        currentY -= size + 4;
      });
      currentY -= 6;
    };

    const drawSectionTitle = (title: string) => {
      ensureSpace(SECTION_FONT_SIZE + 16);
      currentPage.drawText(sanitizeTextForPDF(title), {
        x: PAGE_MARGIN_X,
        y: currentY,
        size: SECTION_FONT_SIZE,
        font: fontBold,
        color: primaryColor,
      });
      currentY -= SECTION_FONT_SIZE + 8;
      currentPage.drawLine({
        start: { x: PAGE_MARGIN_X, y: currentY },
        end: { x: pageWidth - PAGE_MARGIN_X, y: currentY },
        thickness: 1,
        color: borderColor,
      });
      currentY -= 12;
    };

    const drawBulletList = (items: string[]) => {
      if (items.length === 0) {
        currentY -= 6;
        return;
      }
      items.forEach((item) => {
        const lines = wrapText(item, BODY_FONT_SIZE, font);
        ensureSpace(lines.length * (BODY_FONT_SIZE + 4) + 6);
        lines.forEach((line, index) => {
          if (index === 0) {
            currentPage.drawText("•", {
              x: PAGE_MARGIN_X,
              y: currentY,
              size: BODY_FONT_SIZE,
              font: fontBold,
              color: accentColor,
            });
            currentPage.drawText(line, {
              x: PAGE_MARGIN_X + 12,
              y: currentY,
              size: BODY_FONT_SIZE,
              font,
              color: textColor,
            });
          } else {
            currentPage.drawText(line, {
              x: PAGE_MARGIN_X + 12,
              y: currentY,
              size: BODY_FONT_SIZE,
              font,
              color: textColor,
            });
          }
          currentY -= BODY_FONT_SIZE + 4;
        });
        currentY -= 6;
      });
      currentY -= 4;
    };

    const truncateTextToWidth = (
      text: string,
      maxWidth: number,
      fontToUse: typeof font,
      size: number
    ): string => {
      const sanitized = sanitizeTextForPDF(text);
      if (fontToUse.widthOfTextAtSize(sanitized, size) <= maxWidth) {
        return sanitized;
      }
      let truncated = sanitized;
      while (
        truncated.length > 1 &&
        fontToUse.widthOfTextAtSize(`${truncated}...`, size) > maxWidth
      ) {
        truncated = truncated.slice(0, -1);
      }
      return `${truncated}...`;
    };

    const narrativeHeadings = new Set(
      [
        "Introduction",
        "Total Emissions and Carbon Intensity",
        "Emissions Trend Analysis",
        "Emissions Scope Distribution",
        "Emissions Source Breakdown",
        "Project Emissions Breakdown",
        "Resource and Equipment Metrics",
        "Safety Index",
        "Water, Fuel, and Electricity Usage",
        "Waste Generation and Diversion Performance",
        "Material Sourcing and Delivery",
        "Carbon Footprint Comparison",
        "ESG Goal Tracking",
        "Compliance Insights",
        "Delivery Partners",
      ].map((heading) => heading.toLowerCase())
    );

    const renderTable = (rows: string[][], columnFractions: number[]) => {
      if (rows.length === 0) return;
      const contentWidth = pageWidth - PAGE_MARGIN_X * 2;
      const colWidths = columnFractions.map(
        (fraction) => contentWidth * fraction
      );
      const rowHeight = 24;
      ensureSpace(rowHeight * rows.length + 20);
      let tableY = currentY;
      rows.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        const rowTop = tableY;
        currentPage.drawRectangle({
          x: PAGE_MARGIN_X,
          y: rowTop - rowHeight,
          width: contentWidth,
          height: rowHeight,
          color: isHeader
            ? tableHeaderFill
            : rowIndex % 2 === 0
            ? tableAltFill
            : rgb(1, 1, 1),
          borderColor,
          borderWidth: 0.5,
        });
        let xCursor = PAGE_MARGIN_X + CELL_HORIZONTAL_PADDING;
        row.forEach((cell, cellIndex) => {
          const availableWidth =
            colWidths[cellIndex] - CELL_HORIZONTAL_PADDING * 2;
          const textValue = truncateTextToWidth(
            cell,
            availableWidth,
            isHeader ? fontBold : font,
            10
          );
          currentPage.drawText(textValue, {
            x: xCursor,
            y: rowTop - rowHeight + 8,
            size: 10,
            font: isHeader ? fontBold : font,
            color: textColor,
          });
          xCursor += colWidths[cellIndex];
        });
        tableY -= rowHeight;
      });
      currentY = tableY - 18;
    };

    const renderNarrative = (text: string) => {
      const paragraphs = text.split(/\n+/);
      paragraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (!trimmed) {
          currentY -= 8;
          return;
        }
        const headingKey = trimmed.replace(/:$/, "").toLowerCase();
        if (narrativeHeadings.has(headingKey)) {
          ensureSpace(BODY_FONT_SIZE + 18);
          currentPage.drawText(sanitizeTextForPDF(trimmed), {
            x: PAGE_MARGIN_X,
            y: currentY,
            size: BODY_FONT_SIZE + 2,
            font: fontBold,
            color: textColor,
          });
          currentY -= BODY_FONT_SIZE + 10;
          return;
        }
        drawParagraph(trimmed, BODY_FONT_SIZE);
      });
    };

    addNewPage();

    drawSectionTitle("Executive Summary");
    drawParagraph(summarySentences.join(" "));

    drawSectionTitle("Key Performance Metrics");
    renderTable(
      [
        ["Metric", "Value"],
        ["Fuel Used", fuelDisplay],
        ["Electricity Consumption", electricityDisplay],
        ["Equipment Combustion Emissions", emissionsDisplay],
        ["Average Safety TRIR", safetyTrirDisplay],
        ["Total Safety Incidents", incidentsDisplay],
        ["Material Deliveries", deliveriesDisplay],
        ["Material Spend", formatCurrencyPHP(materialSpend)],
        ["Water Consumption", waterDisplay],
        ["Total Waste Generated", wasteDisplay],
      ],
      [0.55, 0.45]
    );

    drawSectionTitle("Environmental Performance");
    drawBulletList(environmentalHighlights);

    drawSectionTitle("Health & Safety");
    drawBulletList(safetyHighlights);

    drawSectionTitle("Supply Chain & Materials");
    drawBulletList(supplierHighlights);
    if (supplierEntries.length > 0) {
      const supplierRows: string[][] = [
        ["Supplier", "Deliveries", "Spend"],
      ];
      supplierEntries.slice(0, 6).forEach(([name, info]) => {
        supplierRows.push([
          name,
          info.count.toString(),
          formatCurrencyPHP(info.spend),
        ]);
      });
      renderTable(supplierRows, [0.5, 0.18, 0.32]);
    }

    drawSectionTitle("AI Narrative");
    renderNarrative(esgReportText);

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
