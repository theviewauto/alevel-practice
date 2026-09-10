interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const subject = url.searchParams.get("subject");
  const topic = url.searchParams.get("topic");
  const limit = Number(url.searchParams.get("limit") ?? "20");

  let query = "SELECT * FROM questions WHERE 1=1";
  const binds: string[] = [];

  if (subject) {
    query += " AND subject = ?";
    binds.push(subject);
  }
  if (topic) {
    query += " AND topic = ?";
    binds.push(topic);
  }
  query += " ORDER BY RANDOM() LIMIT ?";

  const stmt = env.DB.prepare(query).bind(...binds, limit);
  const { results } = await stmt.all();

  return Response.json(results);
};
