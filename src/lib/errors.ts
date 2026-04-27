import type { ApiErrorLike } from "@/lib/types";

export function extractApiErrorMessage(error: ApiErrorLike, fallback: string) {
  const detail = (
    error.body as { detail?: Array<{ loc?: string[]; msg: string }> | string } | undefined
  )?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => `${item.loc?.[item.loc.length - 1]}: ${item.msg}`)
      .join(" | ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  const operationalMessage = getOperationalErrorMessage(error, fallback);
  return operationalMessage !== fallback ? operationalMessage : error.message || fallback;
}

export function getOperationalErrorMessage(error: ApiErrorLike | undefined, fallback: string) {
  const status = error?.status;

  if (status === 401) {
    return "Sessao expirada ou nao autenticada. Entre novamente.";
  }

  if (status === 403) {
    return "Seu perfil nao tem permissao para esta operacao.";
  }

  if (status === 404) {
    return "O recurso solicitado nao foi encontrado no backend.";
  }

  if (status === 422) {
    return "O backend recusou os dados enviados. Revise os campos e tente novamente.";
  }

  if (status && status >= 500) {
    return "A API esta indisponivel ou retornou falha interna. Tente novamente em instantes.";
  }

  if (error?.message === "Failed to fetch" || error?.name === "TypeError") {
    return "Nao foi possivel conectar ao backend configurado.";
  }

  return fallback;
}

export function shouldRetryQueryError(failureCount: number, error: unknown) {
  const typedError = error as ApiErrorLike | undefined;
  const status = typedError?.status;

  if (status === 401 || status === 403 || status === 404) {
    return false;
  }

  if (status && status < 500) {
    return false;
  }

  return failureCount < 2;
}
