"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, ExternalLink, Database } from "lucide-react";

export default function StorageSetupGuide() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const policies = [
    {
      name: "Enable read access for preconstruction-docs bucket",
      sql: `CREATE POLICY "Enable read access for preconstruction-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'preconstruction-docs');`
    },
    {
      name: "Enable read access for construction-docs bucket", 
      sql: `CREATE POLICY "Enable read access for construction-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'construction-docs');`
    },
    {
      name: "Enable read access for esg-reports bucket",
      sql: `CREATE POLICY "Enable read access for esg-reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'esg-reports');`
    }
  ];

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Storage Setup Required
        </CardTitle>
        <CardDescription>
          Your Supabase storage buckets need policies to allow file access. Follow these steps to enable file browsing.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <li>Open your Supabase Dashboard</li>
            <li>Navigate to SQL Editor</li>
            <li>Create a new query</li>
            <li>Copy and run each policy below (one at a time)</li>
            <li>Refresh this page to access your files</li>
          </ol>
        </div>

        {/* Policies */}
        <div className="space-y-4">
          <h3 className="font-semibold">Storage Policies</h3>
          {policies.map((policy, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">{policy.name}</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(policy.sql, index)}
                  className="text-xs"
                >
                  {copiedIndex === index ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedIndex === index ? 'Copied!' : 'Copy SQL'}
                </Button>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                <code>{policy.sql}</code>
              </pre>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button 
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Supabase Dashboard
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>

        {/* Status */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Setup Required
            </Badge>
            <span className="text-sm text-yellow-700 dark:text-yellow-400">
              Files will be accessible once policies are created
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
