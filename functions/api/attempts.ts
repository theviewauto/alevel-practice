interface Env {
  DB: D1Database;
}

// บันทึกการทำโจทย์ทุกครั้ง
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const body = await request.json<{
    attempt_id: string;
    question_id: string;
    subject: string;
    mode: "identify" | "solve";
    confidence_before?: number;
    user_answer?: string;
    correct: boolean;
    time_seconds?: number;
    error_level?: number;
  }>();

  await env.DB.prepare(
    `INSERT INTO attempts
      (attempt_id, question_id, subject, mode, confidence_before, user_answer, correct, time_seconds, error_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.attempt_id,
      body.question_id,
      body.subject,
      body.mode,
      body.confidence_before ?? null,
      body.user_answer ?? null,
      body.correct ? 1 : 0,
      body.time_seconds ?? null,
      body.error_level ?? null
    )
    .run();

  return Response.json({ ok: true });
};

// ดึง Weakness Map: ความแม่นยำ + ความมั่นใจเฉลี่ย แยกตามหัวข้อ
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const { results } = await env.DB.prepare(
    `SELECT
       q.subject,
       q.topic,
       COUNT(*) AS total_attempts,
       SUM(a.correct) AS correct_attempts,
       ROUND(AVG(a.confidence_before), 2) AS avg_confidence,
       ROUND(100.0 * SUM(a.correct) / COUNT(*), 1) AS accuracy_pct
     FROM attempts a
     JOIN questions q ON a.question_id = q.id
     GROUP BY q.subject, q.topic
     ORDER BY accuracy_pct ASC`
  ).all();

  return Response.json(results);
};
