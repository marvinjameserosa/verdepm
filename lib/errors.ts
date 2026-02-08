/**
 * Wraps an async operation in a try-catch block.
 * @param operation The async function to execute.
 * @returns A promise that resolves to an object with either 'data' or 'error'.
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error("Operation failed:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}
