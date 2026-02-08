export const isMissingRelationError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { code, message } = error as { code?: string; message?: string };
  if (code === "42P01") {
    return true;
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return false;
  }

  const normalized = message.toLowerCase();
  if (normalized.includes("column")) {
    return false;
  }

  if (normalized.includes("row-level security") || normalized.includes("rls")) {
    return false;
  }

  if (normalized.includes("does not exist") && normalized.includes("relation")) {
    return true;
  }

  if (normalized.includes("schema cache") && normalized.includes("relation")) {
    return true;
  }

  return false;
};
