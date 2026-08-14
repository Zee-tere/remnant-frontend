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

  const status = maybeAxios.response?.status;
  if (status && status >= 500) return "We couldn’t complete that just now. Please try again in a moment.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have access to complete this action.";
  if (status === 413) return "That file is too large. Please choose a smaller image.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";

  const technicalMessage = /(?:aws|s3|bucket|prisma|database|sql|lambda|stack|exception|econn|enotfound|configured|configuration|endpoint|internal server|status code|request failed|constraint|credential|secret|policy)/i;
  const responseMessage = maybeAxios.response?.data?.message;
  const message = Array.isArray(responseMessage) ? responseMessage[0] : responseMessage;
  if (typeof message === "string" && message.trim() && !technicalMessage.test(message)) return message;

  if (status === 400) return "Please check the details and try again.";
  if (status === 404) return "We couldn’t find what you requested.";

  if (maybeAxios.message === "Network Error") return "Check your connection and try again.";
  if (maybeAxios.message && !technicalMessage.test(maybeAxios.message)) return maybeAxios.message;
  return fallback;
}
