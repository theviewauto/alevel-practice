import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { CSSProperties } from "react";

type Question = {
  id: string;
  subject: string;
  section: string;
  topic: string;
  difficulty: string;
  skill_measured: string;
  format: string;
  question: string;
  choices: string; // JSON string from D1, needs parsing
  answer: string;
  solution_steps: string; // JSON string
  common_mistakes: string; // JSON string
};

const SUBJECT_TITLES: Record<string, string> = {
  math1: "คณิตศาสตร์ประยุกต์ 1",
  phy: "ฟิสิกส์",
  chem: "เคมี",
  bio: "ชีววิทยา",
};

const CONFIDENCE_LABELS = [
  { value: 1, label: "ไม่รู้เลยจะเริ่มยังไง" },
  { value: 2, label: "รู้หัวข้อ แต่ไม่มั่นใจวิธี" },
  { value: 3, label: "รู้วิธี แต่ไม่มั่นใจคำตอบ" },
  { value: 4, label: "มั่นใจเต็มที่" },
];

function parseJsonSafe<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// สไตล์คงที่ (ไม่ขึ้นกับ state) แยกไว้เป็น Record<string, CSSProperties> ล้วนๆ
const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 720, margin: "0 auto", padding: "32px 20px", fontFamily: "inherit" },
  backLink: { display: "inline-block", marginBottom: 16, color: "#6b7280", textDecoration: "none" },
  progress: { color: "#6b7280", marginBottom: 8, fontSize: 14 },
  card: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, marginBottom: 20 },
  topic: { display: "inline-block", background: "#eef2ff", color: "#4338ca", fontSize: 12, padding: "4px 10px", borderRadius: 999, marginBottom: 12 },
  question: { fontSize: 18, fontWeight: 600, marginBottom: 20, lineHeight: 1.6 },
  confidenceRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  primaryBtn: { background: "#4338ca", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" },
  explanation: { background: "#f9fafb", borderRadius: 12, padding: 16, marginTop: 16 },
};

// สไตล์ที่ขึ้นกับ state แยกเป็นฟังก์ชันต่างหาก ไม่ปนกับ record ด้านบน
function choiceStyle(active: boolean, isAnswer: boolean, showResult: boolean, revealed: boolean): CSSProperties {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid " + (showResult && isAnswer ? "#16a34a" : active ? "#4338ca" : "#e5e7eb"),
    background: showResult && isAnswer ? "#f0fdf4" : active ? "#eef2ff" : "#fff",
    marginBottom: 10,
    cursor: revealed ? "default" : "pointer",
  };
}

function confidenceBtnStyle(active: boolean): CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid " + (active ? "#4338ca" : "#e5e7eb"),
    background: active ? "#4338ca" : "#fff",
    color: active ? "#fff" : "#374151",
    fontSize: 13,
    cursor: "pointer",
  };
}

export default function QuizPage() {
  const { subjectId = "" } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    fetch(`/api/questions?subject=${encodeURIComponent(subjectId)}&limit=16`)
      .then((res) => {
        if (!res.ok) throw new Error("โหลดโจทย์ไม่สำเร็จ");
        return res.json();
      })
      .then((data: Question[]) => {
        setQuestions(data);
        setStartTime(Date.now());
      })
      .catch(() => setErrorMsg("โหลดโจทย์ไม่สำเร็จ ลองรีเฟรชหน้าใหม่"))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const current = questions[currentIndex];
  const choices = current ? parseJsonSafe<string[]>(current.choices, []) : [];
  const steps = current ? parseJsonSafe<string[]>(current.solution_steps, []) : [];
  const mistakes = current ? parseJsonSafe<string[]>(current.common_mistakes, []) : [];

  const submitAnswer = async () => {
    if (!current || selectedChoice === null || confidence === null) return;
    const correct = selectedChoice === current.answer;
    const timeSeconds = Math.round((Date.now() - startTime) / 1000);

    setRevealed(true);
    if (correct) setScore((s) => s + 1);

    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: crypto.randomUUID(),
          question_id: current.id,
          subject: current.subject,
          mode: "solve",
          confidence_before: confidence,
          user_answer: selectedChoice,
          correct,
          time_seconds: timeSeconds,
          error_level: null, // ผู้ใช้เลือกระดับ error เองภายหลังได้ในเวอร์ชันถัดไป
        }),
      });
    } catch {
      // การบันทึกล้มเหลวไม่ควรบล็อกการทำโจทย์ต่อ
    }
  };

  const nextQuestion = () => {
    setCurrentIndex((i) => i + 1);
    setSelectedChoice(null);
    setConfidence(null);
    setRevealed(false);
    setStartTime(Date.now());
  };

  if (loading) {
    return <div style={styles.page}>กำลังโหลดโจทย์...</div>;
  }

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
      <h2>{SUBJECT_TITLES[subjectId] ?? subjectId}</h2>

      {errorMsg && <p style={{ color: "#dc2626" }}>{errorMsg}</p>}

      {!errorMsg && questions.length === 0 && (
        <p>ยังไม่มีข้อสอบวิชานี้ในระบบ อยู่ระหว่างจัดทำ — ลองวิชาคณิตศาสตร์ประยุกต์ 1 ก่อนได้เลย</p>
      )}

      {!errorMsg && questions.length > 0 && currentIndex < questions.length && current && (
        <>
          <p style={styles.progress}>
            ข้อที่ {currentIndex + 1} / {questions.length} · คะแนนตอนนี้ {score} ข้อ
          </p>

          <div style={styles.card}>
            <span style={styles.topic}>{current.topic}</span>
            <p style={styles.question}>{current.question}</p>

            {choices.map((choice) => (
              <button
                key={choice}
                style={choiceStyle(selectedChoice === choice, choice === current.answer, revealed, revealed)}
                onClick={() => !revealed && setSelectedChoice(choice)}
                disabled={revealed}
              >
                {choice}
              </button>
            ))}

            {!revealed && (
              <>
                <p style={{ marginTop: 16, marginBottom: 8, fontSize: 14, color: "#374151" }}>
                  ก่อนดูเฉลย — มั่นใจแค่ไหนกับคำตอบนี้
                </p>
                <div style={styles.confidenceRow}>
                  {CONFIDENCE_LABELS.map((c) => (
                    <button
                      key={c.value}
                      style={confidenceBtnStyle(confidence === c.value)}
                      onClick={() => setConfidence(c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <button
                  style={styles.primaryBtn}
                  onClick={submitAnswer}
                  disabled={selectedChoice === null || confidence === null}
                >
                  ตรวจคำตอบ
                </button>
              </>
            )}

            {revealed && (
              <div style={styles.explanation}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>
                  {selectedChoice === current.answer ? "ตอบถูก ✅" : `ตอบผิด — เฉลยคือ ${current.answer}`}
                </p>
                {steps.map((step, i) => (
                  <p key={i} style={{ marginBottom: 4, fontSize: 14 }}>
                    {i + 1}. {step}
                  </p>
                ))}
                {mistakes.length > 0 && (
                  <p style={{ marginTop: 10, fontSize: 13, color: "#b45309" }}>
                    จุดที่มักพลาด: {mistakes.join(" / ")}
                  </p>
                )}
                <button style={{ ...styles.primaryBtn, marginTop: 16 }} onClick={nextQuestion}>
                  ข้อถัดไป →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {!errorMsg && questions.length > 0 && currentIndex >= questions.length && (
        <div style={styles.card}>
          <h3>ทำครบแล้ว 🎉</h3>
          <p>
            ได้ {score} / {questions.length} ข้อ
          </p>
          <Link to="/" style={styles.backLink}>← กลับไปเลือกวิชาอื่น</Link>
        </div>
      )}
    </div>
  );
}
