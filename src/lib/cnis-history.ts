"use client";

import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";

export type SavedCnisAnalysis = {
  id: string;
  createdAt: Date | null;
  fileName: string;
  summary: string;
  tempoContribuicaoTotal: string;
  carenciaTotal: number;
  qualityScore: number;
  analysis: Record<string, unknown>;
};

function toPlainObject(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value ?? {})) as Record<string, unknown>;
}

export async function saveCnisAnalysis(user: User, analysis: unknown, fileName: string) {
  const data = toPlainObject(analysis);
  const ref = await addDoc(collection(db, "cnisAnalyses"), {
    uid: user.uid,
    fileName: fileName || "CNIS.pdf",
    createdAt: serverTimestamp(),
    summary: typeof data.summary === "string" ? data.summary : "Análise de CNIS concluída.",
    tempoContribuicaoTotal: typeof data.tempoContribuicaoTotal === "string" ? data.tempoContribuicaoTotal : "Não identificado",
    carenciaTotal: typeof data.carenciaTotal === "number" ? data.carenciaTotal : 0,
    qualityScore: typeof data.qualityScore === "number" ? data.qualityScore : 0,
    analysis: data,
  });
  return ref.id;
}

export async function listSavedCnisAnalyses(user: User): Promise<SavedCnisAnalysis[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "cnisAnalyses"),
      where("uid", "==", user.uid),
      limit(50),
    ),
  );

  return snapshot.docs.map((item) => {
    const data = item.data();
    const timestamp = data.createdAt as Timestamp | undefined;
    return {
      id: item.id,
      createdAt: timestamp?.toDate?.() ?? null,
      fileName: typeof data.fileName === "string" ? data.fileName : "CNIS.pdf",
      summary: typeof data.summary === "string" ? data.summary : "",
      tempoContribuicaoTotal: typeof data.tempoContribuicaoTotal === "string" ? data.tempoContribuicaoTotal : "Não identificado",
      carenciaTotal: typeof data.carenciaTotal === "number" ? data.carenciaTotal : 0,
      qualityScore: typeof data.qualityScore === "number" ? data.qualityScore : 0,
      analysis: (data.analysis ?? {}) as Record<string, unknown>,
    };
  }).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}
