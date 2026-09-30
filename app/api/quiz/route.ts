import { NextResponse } from "next/server";
import { appendRecord } from "@/lib/store";
import { getViewer } from "@/lib/session";
import { QUIZ } from "@/lib/quiz";

// Scores are recomputed server-side from the submitted answers.
export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Not registered" }, { status: 401 });

  let answers: unknown;
  try {
    ({ answers } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length !== QUIZ.length) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 422 });
  }

  const score = QUIZ.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  await appendRecord("quiz-results", {
    userId: viewer.id,
    name: viewer.name,
    answers,
    score,
    total: QUIZ.length,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, score, total: QUIZ.length });
}
