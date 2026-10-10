import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function withTemporaryDirectory<T>(prefix: string, task: (directory: string) => Promise<T>): Promise<T> {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  let taskFailed = false;
  try {
    return await task(directory);
  } catch (error) {
    taskFailed = true;
    throw error;
  } finally {
    try {
      await rm(directory, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("[CNIS] Falha ao excluir diretório temporário.", cleanupError instanceof Error ? cleanupError.name : "erro_desconhecido");
      if (!taskFailed) throw cleanupError;
    }
  }
}
