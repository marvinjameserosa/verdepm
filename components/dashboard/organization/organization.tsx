"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ClipboardList, FileCheck2, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useOrganizationDocuments, type DocumentType } from "@/hooks/useOrganizationDocuments";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("@/components/ui/location-picker-map"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md" />
});

const DOCUMENT_REQUIREMENTS = [
  {
    id: "sec-dti",
    label: "SEC or DTI Certificate",
    description:
      "Provide a scanned copy of the organization’s latest registration document (PDF, max 5 MB).",
    status: "Pending",
  },
  {
    id: "mayors-permit",
    label: "Mayor’s Permit",
    description:
      "Upload the most recent business permit for headquarters or principal place of business.",
    status: "In Review",
  },
  {
    id: "bir",
    label: "BIR Certificate of Registration",
    description:
      "Ensure the BIR Form 2303 is up to date and clearly legible for audit purposes.",
    status: "Approved",
  },
];

export function OrganizationTab() {
  // Hardcoded organization ID - Carl's permanent org
  const ORGANIZATION_ID = "d4f2bb4d-6bea-4d34-9790-7d7ff000e78a";

  const [recordId, setRecordId] = useState<string | null>(null);
  const [parentEntity, setParentEntity] = useState("");
  const [primaryRegion, setPrimaryRegion] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Document upload hook
  const {
    isUploading,
    uploadError,
    handleDocumentUpload,
    handleDocumentRemove,
    getDocumentByType,
  } = useOrganizationDocuments(ORGANIZATION_ID);

  useEffect(() => {
    let isMounted = true;

    const loadOrganizationProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("organization_id, organization_name, registration_number, contact_email, primary_region, owner_name, owner_email, owner_phone")
          .eq("organization_id", ORGANIZATION_ID)
          .single();

        if (error) {
          throw error;
        }

        if (data && isMounted) {
          setParentEntity(data.organization_name ?? "");
          setPrimaryRegion(data.primary_region ?? "");
          setRegistrationNumber(data.registration_number ?? "");
          setContactEmail(data.contact_email ?? "");
          setOwnerName(data.owner_name ?? "");
          setOwnerEmail(data.owner_email ?? "");
          setOwnerPhone(data.owner_phone ?? "");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load organization profile", error);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load organization details."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrganizationProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        organization_name: parentEntity.trim() || null,
        primary_region: primaryRegion.trim() || null,
        registration_number: registrationNumber.trim() || null,
        contact_email: contactEmail.trim() || null,
        owner_name: ownerName.trim() || null,
        owner_email: ownerEmail.trim() || null,
        owner_phone: ownerPhone.trim() || null,
      };

      const { error } = await supabase
        .from("organizations")
        .update(payload)
        .eq("organization_id", ORGANIZATION_ID);

      if (error) {
        throw error;
      }

      setStatusMessage("Organization details saved.");
    } catch (error) {
      console.error("Failed to save organization profile", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save details."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization</h2>
          <p className="text-muted-foreground">
            Centralize compliance requirements, legal entities, and ESG
            oversight in one view.
          </p>
        </div>
      </div>

      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <Building2 className="h-5 w-5" />
            Company Overview
          </CardTitle>
          <CardDescription>
            Capture the organization parent entity and the primary region it
            governs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="parent-entity">Parent Entity</Label>
            <Input
              id="parent-entity"
              placeholder="e.g., VerdePM Holdings, Inc."
              value={parentEntity}
              onChange={(event) => setParentEntity(event.target.value)}
              disabled={isLoading || isSaving}
            />
            <p className="text-xs text-muted-foreground">
              This name appears across project setup and compliance reports.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Primary Region</Label>
            <LocationPickerMap
              value={primaryRegion}
              onChange={setPrimaryRegion}
            />
            <p className="text-xs text-muted-foreground">
              Used to contextualize ESG benchmarks and regulatory references.
            </p>
          </div>

          {/* Registration Number and Contact Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration-number">Registration Number</Label>
              <Input
                id="registration-number"
                placeholder="e.g., SEC-12345678"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
                disabled={isLoading || isSaving}
              />
              <p className="text-xs text-muted-foreground">
                SEC or DTI registration number.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="e.g., contact@verdepm.com"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                disabled={isLoading || isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Primary organizational contact email.
              </p>
            </div>
          </div>

          {/* Owner Details Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Owner Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner-name">Owner Name</Label>
                <Input
                  id="owner-name"
                  placeholder="Full Name"
                  value={ownerName}
                  onChange={(event) => setOwnerName(event.target.value)}
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-email">Owner Email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  placeholder="Email Address"
                  value={ownerEmail}
                  onChange={(event) => setOwnerEmail(event.target.value)}
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-phone">Owner Phone</Label>
                <Input
                  id="owner-phone"
                  placeholder="Phone Number"
                  value={ownerPhone}
                  onChange={(event) => setOwnerPhone(event.target.value)}
                  disabled={isLoading || isSaving}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {statusMessage && (
              <p className="text-emerald-600 dark:text-emerald-400">
                {statusMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Minimum Document Requirements
              </CardTitle>
              <CardDescription>
                Track the baseline compliance files every project must have on
                record before pre-construction kickoff.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
            </div>
          )}
          {DOCUMENT_REQUIREMENTS.map((item) => {
            const documentType = item.id as DocumentType;
            const uploadedDoc = getDocumentByType(documentType);
            const isUploadingThis = isUploading[documentType];
            const hasDocument = uploadedDoc?.fileUrl;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900/40 bg-white/70 dark:bg-gray-900/40 p-4 space-y-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-emerald-600" />
                      {item.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="self-start text-xs"
                  >
                    {hasDocument ? 'Uploaded' : item.status}
                  </Badge>
                </div>

                {hasDocument ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileCheck2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 truncate">
                          Document uploaded
                        </p>
                        {uploadedDoc.uploadedAt && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            Uploaded {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(uploadedDoc.fileUrl!, '_blank')}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentRemove(documentType)}
                        disabled={isUploadingThis}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id={`file-${item.id}`}
                      accept=".pdf,image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDocumentUpload(documentType, file);
                          e.target.value = '';
                        }
                      }}
                      disabled={isUploadingThis}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                      disabled={isUploadingThis}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingThis ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default OrganizationTab;
