export const isMissingRelationError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { code, message } = error as { code?: string; message?: string };
  if (code === "42P01") {
    return true;
  }

  if (typeof message === "string") {
    const normalizedMessage = message.toLowerCase();
    return (
      normalizedMessage.includes("does not exist") ||
      normalizedMessage.includes("could not find the table") ||
      normalizedMessage.includes("schema cache")
    );
  }

  return false;
};
