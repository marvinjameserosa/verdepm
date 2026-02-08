import { supabase } from "@/lib/supabase/client";
import type {
    UploadOrganizationDocumentParams,
    UploadOrganizationDocumentResult,
} from "@/types/actions";

const DOCS_BUCKET =
    process.env.NEXT_PUBLIC_SUPABASE_DOCS_BUCKET ?? "organization-docs";

// Helper to get column names for a document type
const getColumnNames = (documentType: string) => {
    const prefix = documentType.replace(/-/g, '_');
    return {
        storagePath: `${prefix}_storage_path`,
        fileUrl: `${prefix}_file_url`,
        uploadedAt: `${prefix}_uploaded_at`,
    };
};

export async function uploadOrganizationDocument({
    organizationId,
    documentType,
    file,
    previousPath,
}: UploadOrganizationDocumentParams): Promise<UploadOrganizationDocumentResult> {
    const extension = file.name.split(".").pop() || "pdf";
    const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`;
    const filePath = `${organizationId}/${documentType}/${uniqueId}.${extension}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
        .from(DOCS_BUCKET)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
        });

    if (uploadError) {
        throw new Error(uploadError.message || "Unable to upload document.");
    }

    // Remove previous file if it exists
    if (previousPath && previousPath !== filePath) {
        try {
            await supabase.storage.from(DOCS_BUCKET).remove([previousPath]);
        } catch (removalError) {
            console.warn("Failed to remove previous document", removalError);
        }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from(DOCS_BUCKET)
        .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
        throw new Error("Unable to resolve uploaded document URL.");
    }

    // Update organization record with file info
    const columns = getColumnNames(documentType);
    const { error: dbError } = await supabase
        .from("organizations")
        .update({
            [columns.storagePath]: filePath,
            [columns.fileUrl]: publicUrl,
            [columns.uploadedAt]: new Date().toISOString(),
        })
        .eq("organization_id", organizationId);

    if (dbError) {
        // If database update fails, try to clean up the uploaded file
        try {
            await supabase.storage.from(DOCS_BUCKET).remove([filePath]);
        } catch (cleanupError) {
            console.warn("Failed to cleanup uploaded file", cleanupError);
        }
        throw new Error(dbError.message || "Unable to save document record.");
    }

    return {
        publicUrl,
        filePath,
    };
}

export async function removeOrganizationDocument(
    organizationId: string,
    documentType: string
): Promise<void> {
    const columns = getColumnNames(documentType);

    // Get the current storage path
    const { data: org, error: fetchError } = await supabase
        .from("organizations")
        .select(columns.storagePath)
        .eq("organization_id", organizationId)
        .single();

    if (fetchError || !org) {
        throw new Error("Organization not found.");
    }

    const storagePath = org[columns.storagePath as keyof typeof org];

    if (storagePath && typeof storagePath === 'string') {
        // Remove from storage
        const { error: storageError } = await supabase.storage
            .from(DOCS_BUCKET)
            .remove([storagePath]);

        if (storageError) {
            console.warn("Failed to remove file from storage", storageError);
        }
    }

    // Clear the columns in the database
    const { error: dbError } = await supabase
        .from("organizations")
        .update({
            [columns.storagePath]: null,
            [columns.fileUrl]: null,
            [columns.uploadedAt]: null,
        })
        .eq("organization_id", organizationId);

    if (dbError) {
        throw new Error(dbError.message || "Unable to remove document record.");
    }
}

export async function getOrganizationDocuments(organizationId: string) {
    const { data, error } = await supabase
        .from("organizations")
        .select(
            `
      organization_id,
      sec_dti_storage_path,
      sec_dti_file_url,
      sec_dti_uploaded_at,
      mayors_permit_storage_path,
      mayors_permit_file_url,
      mayors_permit_uploaded_at,
      bir_storage_path,
      bir_file_url,
      bir_uploaded_at
    `
        )
        .eq("organization_id", organizationId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching organization documents:", error);
        throw new Error(error.message || "Unable to fetch documents.");
    }

    // If no organization found, return empty data
    if (!data) {
        return {
            organization_id: organizationId,
            sec_dti_storage_path: null,
            sec_dti_file_url: null,
            sec_dti_uploaded_at: null,
            mayors_permit_storage_path: null,
            mayors_permit_file_url: null,
            mayors_permit_uploaded_at: null,
            bir_storage_path: null,
            bir_file_url: null,
            bir_uploaded_at: null,
        };
    }

    return data;
}
