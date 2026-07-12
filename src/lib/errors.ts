export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  const maybeAxios = error as {
    response?: {
      status?: number;
      data?: {
        message?: string | string[];
        error?: string;
      };
    };
    message?: string;
  };

  const message = maybeAxios.response?.data?.message;
  if (Array.isArray(message) && message.length > 0) return message[0];
  if (typeof message === "string" && message.trim()) return message;

  const status = maybeAxios.response?.status;
  if (status === 400) return "Please check the details and try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have access to complete this action.";
  if (status === 413) return "That file is too large. Please choose a smaller image.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status && status >= 500) return "The server could not complete this right now. Please try again shortly.";

  if (maybeAxios.message && maybeAxios.message !== "Network Error") return maybeAxios.message;
  return fallback;
}
