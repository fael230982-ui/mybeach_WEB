type LoggerMeta = Record<string, unknown> | undefined;

function canLog() {
  return process.env.NODE_ENV !== "production";
}

export function logClientError(context: string, error: unknown, meta?: LoggerMeta) {
  if (!canLog()) {
    return;
  }

  console.error(`[${context}]`, error, meta);
}

export function logClientInfo(context: string, meta?: LoggerMeta) {
  if (!canLog()) {
    return;
  }

  console.info(`[${context}]`, meta);
}
