import { NextResponse } from "next/server";

export async function GET() {
  const policies = {
    message: "Copy these SQL policies into your Supabase SQL Editor to enable file access",
    policies: [
      {
        name: "Enable read access for preconstruction-docs bucket",
        sql: `-- Policy: Enable read access for preconstruction-docs bucket
CREATE POLICY "Enable read access for preconstruction-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'preconstruction-docs');`
      },
      {
        name: "Enable read access for construction-docs bucket", 
        sql: `-- Policy: Enable read access for construction-docs bucket
CREATE POLICY "Enable read access for construction-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'construction-docs');`
      },
      {
        name: "Enable read access for esg-reports bucket",
        sql: `-- Policy: Enable read access for esg-reports bucket  
CREATE POLICY "Enable read access for esg-reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'esg-reports');`
      },
      {
        name: "Enable insert access for authenticated users on preconstruction-docs",
        sql: `-- Policy: Enable insert access for authenticated users on preconstruction-docs
CREATE POLICY "Enable insert for authenticated users on preconstruction-docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'preconstruction-docs' AND auth.role() = 'authenticated');`
      },
      {
        name: "Enable insert access for authenticated users on construction-docs",
        sql: `-- Policy: Enable insert access for authenticated users on construction-docs
CREATE POLICY "Enable insert for authenticated users on construction-docs" 
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'construction-docs' AND auth.role() = 'authenticated');`
      },
      {
        name: "Enable insert access for authenticated users on esg-reports",
        sql: `-- Policy: Enable insert access for authenticated users on esg-reports
CREATE POLICY "Enable insert for authenticated users on esg-reports"
ON storage.objects FOR INSERT  
WITH CHECK (bucket_id = 'esg-reports' AND auth.role() = 'authenticated');`
      }
    ],
    instructions: [
      "1. Go to your Supabase Dashboard",
      "2. Navigate to SQL Editor", 
      "3. Create a new query",
      "4. Copy and paste each SQL policy above",
      "5. Run each policy individually",
      "6. Verify policies are created in Storage > Policies section"
    ]
  };

  return NextResponse.json(policies);
}

export async function POST() {
  return NextResponse.json({
    message: "Storage policies setup guide",
    note: "These policies need to be created manually in Supabase Dashboard"
  });
}
