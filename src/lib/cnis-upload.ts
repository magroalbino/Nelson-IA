export const MAX_CNIS_BYTES = 25 * 1024 * 1024;

export type CnisUploadCandidate = {
  size: number;
  bytes: Uint8Array;
};

export function validateCnisUpload(candidate: CnisUploadCandidate): string | null {
  if (candidate.size === 0) return "O arquivo enviado está vazio.";
  if (candidate.size > MAX_CNIS_BYTES) return "O PDF deve ter no máximo 25 MB.";
  if (Buffer.from(candidate.bytes).subarray(0, 5).toString("ascii") !== "%PDF-") {
    return "O arquivo enviado não parece ser um PDF válido.";
  }
  return null;
}
