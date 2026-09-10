import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { CSSProperties } from "react";

type Question = {
  id: string;
  subject: string;
  topic: string;
  integrates_with: string;
  question: string;
};

const SUBJECT_TITLES: Record<string, string> = {
  math1: "คณิตศาสตร์ประยุกต์ 1",
  phy: "ฟิสิกส์",
  chem: "เคมี",
  bio: "ชีววิทยา",
};

function parseJsonSafe<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 680, margin: "0 auto", padding: "32px 20px", fontFamily: "inherit" },
  backLink: { display: "inline-block", marginBottom: 16, color: "#6b7280", textDecoration: "none" },
  progress: { color: "#6b7280", marginBottom: 8, fontSize: 14 },
  card: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, marginBottom: 20 },
  badge: { display: "inline-block", background: "#f5f3ff", color: "#6d28d9", fontSize: 12, padding: "4px 10px", borderRadius: 999, marginBottom: 12 },
  question: { fontSize: 17, fontWeight: 600, marginBottom: 20, lineHeight: 1.6 },
  primaryBtn: { background: "#6d28d9", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 14, cursor: "pointer", marginTop: 12 },
  note: { background: "#f9fafb", borderRadius: 10, padding: 12, marginTop: 12, fontSize: 13, color: "#374151" },
};

function optionStyle(active: boolean, isCorrect: boolean, showResult: boolean): CSSProperties {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid " + (showResult && isCorrect ? "#16a34a" : active ? "#6d28d9" : "#e5e7eb"),
    background: showResult && isCorrect ? "#f0fdf4" : active ? "#f5f3ff" : "#fff",
    marginBottom: 10,
    cursor: showResult ? "default" : "pointer",
  };
}

export default function IdentifyPage() {
  const { subjectId = "" } = useParams();
  const [pool, setPool] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    fetch(`/api/questions?subject=${encodeURIComponent(subjectId)}&limit=30`)
      .then((res) => {
        if (!res.ok) throw new Error("โหลดโจทย์ไม่สำเร็จ");
        return res.json();
      })
      .then((data: Question[]) => setPool(data))
      .catch(() => setErrorMsg("โหลดโจทย์ไม่สำเร็จ ลองรีเฟรชหน้าใหม่"))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const allTopics = useMemo(() => Array.from(new Set(pool.map((q) => q.topic))), [pool]);
  const current = pool[currentIndex];

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = shuffle(allTopics.filter((t) => t !== current.topic)).slice(0, 3);
    return shuffle([current.topic, ...distractors]);
  }, [current, allTopics]);

  const relatedTopics = current ? parseJsonSafe<string[]>(current.integrates_with, []) : [];

  const selectOption = async (topic: string) => {
    if (revealed || !current) return;
    setSelected(topic);
    setRevealed(true);
    const correct = topic === current.topic;
    if (correct) setScore((s) => s + 1);
    const timeSeconds = Math.round((Date.now() - startTime) / 1000);
    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: crypto.randomUUID(),
          question_id: current.id,
          subject: current.subject,
          mode: "identify",
          confidence_before: null,
          user_answer: topic,
          correct,
          time_seconds: timeSeconds,
          error_level: null,
        }),
      });
    } catch {
      // ไม่บล็อกการฝึกต่อถ้าบันทึกล้มเหลว
    }
  };

  const next = () => {
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setStartTime(Date.now());
  };

  if (loading) return <div style={styles.page}>กำลังโหลดโจทย์...</div>;

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
      <h2>โหมดวิเคราะห์ — {SUBJECT_TITLES[subjectId] ?? subjectId}</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
        ไม่ต้องคำนวณ แค่บอกว่าโจทย์นี้ต้องใช้หัวข้อไหนเป็นหลัก
      </p>

      {errorMsg && <p style={{ color: "#dc2626" }}>{errorMsg}</p>}

      {!errorMsg && pool.length === 0 && (
        <p>ยังไม่มีข้อสอบวิชานี้ในระบบ อยู่ระหว่างจัดทำ</p>
      )}

      {!errorMsg && pool.length > 0 && currentIndex < pool.length && current && (
        <>
          <p style={styles.progress}>
            ข้อที่ {currentIndex + 1} / {pool.length} · ตอบถูก {score} ข้อ
          </p>
          <div style={styles.card}>
            <span style={styles.badge}>โจทย์ประยุกต์</span>
            <p style={styles.question}>{current.question}</p>

            {options.map((topic) => (
              <button
                key={topic}
                style={optionStyle(selected === topic, topic === current.topic, revealed)}
                onClick={() => selectOption(topic)}
                disabled={revealed}
              >
                {topic}
              </button>
            ))}

            {revealed && (
              <>
                <p style={{ fontWeight: 600, marginTop: 8 }}>
                  {selected === current.topic ? "ถูกต้อง ✅" : `ไม่ถูก — หัวข้อหลักคือ ${current.topic}`}
                </p>
                {relatedTopics.length > 0 && (
                  <div style={styles.note}>
                    โจทย์ข้อนี้ยังผสมกับหัวข้อ: <strong>{relatedTopics.join(", ")}</strong> ด้วย
                  </div>
                )}
                <button style={styles.primaryBtn} onClick={next}>
                  ข้อถัดไป →
                </button>
              </>
            )}
          </div>
        </>
      )}

      {!errorMsg && pool.length > 0 && currentIndex >= pool.length && (
        <div style={styles.card}>
          <h3>ฝึกครบชุดแล้ว 🎉</h3>
          <p>วิเคราะห์ถูก {score} / {pool.length} ข้อ</p>
          <Link to="/" style={styles.backLink}>← กลับไปเลือกวิชาอื่น</Link>
        </div>
      )}
    </div>
  );
}
