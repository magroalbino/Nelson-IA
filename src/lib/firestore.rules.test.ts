import fs from "node:fs";
import path from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const PROJECT_ID = "studio-4035352308-356c4";
const COLLECTION = "cnisAnalyses";
const ANALYSIS_ID = "analysis-test-1";
const OWNER_UID = "user-owner";
const OTHER_UID = "user-other";

let testEnv: RulesTestEnvironment;
const emulatorIsRunning = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

function analysisData(uid = OWNER_UID) {
  return {
    uid,
    fileName: "CNIS-teste.pdf",
    createdAt: Timestamp.now(),
    summary: "Análise anonimizada para teste",
    tempoContribuicaoTotal: "10 anos",
    carenciaTotal: 120,
    qualityScore: 90,
    analysis: {
      resumo: "Dados de teste sem informações pessoais",
    },
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync(path.resolve(process.cwd(), "firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), COLLECTION, ANALYSIS_ID),
      analysisData(),
    );
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe.skipIf(!emulatorIsRunning)("Regras de segurança de cnisAnalyses", () => {
  it("permite o proprietário excluir a própria análise", async () => {
    const db = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertSucceeds(deleteDoc(doc(db, COLLECTION, ANALYSIS_ID)));

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const snapshot = await getDoc(
        doc(context.firestore(), COLLECTION, ANALYSIS_ID),
      );
      expect(snapshot.exists()).toBe(false);
    });
  });

  it("bloqueia outro usuário de excluir a análise", async () => {
    const db = testEnv.authenticatedContext(OTHER_UID).firestore();

    await assertFails(deleteDoc(doc(db, COLLECTION, ANALYSIS_ID)));
  });

  it("bloqueia usuário não autenticado de excluir a análise", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(deleteDoc(doc(db, COLLECTION, ANALYSIS_ID)));
  });

  it("permite o proprietário ler a própria análise", async () => {
    const db = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertSucceeds(getDoc(doc(db, COLLECTION, ANALYSIS_ID)));
  });

  it("bloqueia outro usuário de ler a análise", async () => {
    const db = testEnv.authenticatedContext(OTHER_UID).firestore();

    await assertFails(getDoc(doc(db, COLLECTION, ANALYSIS_ID)));
  });

  it("bloqueia atualização da análise", async () => {
    const db = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertFails(
      setDoc(
        doc(db, COLLECTION, ANALYSIS_ID),
        { summary: "Tentativa de alteração" },
        { merge: true },
      ),
    );
  });

  it("bloqueia criação de análise com UID diferente do usuário autenticado", async () => {
    const db = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertFails(
      setDoc(doc(db, COLLECTION, "analysis-invalid-owner"), analysisData(OTHER_UID)),
    );
  });
});
