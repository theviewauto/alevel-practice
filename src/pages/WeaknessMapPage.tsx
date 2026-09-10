import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";

type WeaknessRow = {
  subject: string;
  topic: string;
  total_attempts: number;
  correct_attempts: number;
  avg_confidence: number | null;
  accuracy_pct: number | null;
};

const SUBJECT_TITLES: Record<string, string> = {
  math1: "คณิตศาสตร์ประยุกต์ 1",
  phy: "ฟิสิกส์",
  chem: "เคมี",
  bio: "ชีววิทยา",
};

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 900, margin: "0 auto", padding: "32px 20px", fontFamily: "inherit" },
  backLink: { display: "inline-block", marginBottom: 16, color: "#6b7280", textDecoration: "none" },
  legend: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20, fontSize: 13, color: "#374151" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 },
  td: { padding: "10px 12px", borderBottom: "1px solid #f3f4f6" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 },
  summaryCard: { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 },
  summaryAccuracy: { fontSize: 28, fontWeight: 700, margin: "6px 0 12px" },
};

function legendDotStyle(color: string): CSSProperties {
  return {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: 999,
    background: color,
    marginRight: 6,
  };
}

function rowStatus(row: WeaknessRow): { label: string; bg: string; dot: string } {
  const acc = row.accuracy_pct ?? 0;
  const conf = row.avg_confidence ?? 0;

  if (conf >= 3 && acc < 60) {
    return { label: "มั่นใจเกินจริง — เสี่ยงพลาดในห้องสอบ", bg: "#fef2f2", dot: "#dc2626" };
  }
  if (conf <= 2 && acc >= 80) {
    return { label: "ไม่มั่นใจแต่จริงๆ ทำได้ดี", bg: "#eff6ff", dot: "#2563eb" };
  }
  if (acc < 60) {
    return { label: "จุดอ่อนที่ต้องฝึกเพิ่ม", bg: "#fff7ed", dot: "#ea580c" };
  }
  return { label: "อยู่ในเกณฑ์ดี", bg: "#f0fdf4", dot: "#16a34a" };
}

type SubjectSummary = {
  subject: string;
  totalAttempts: number;
  overallAccuracy: number;
  needsReview: WeaknessRow[];
};

function summarizeBySubject(rows: WeaknessRow[]): SubjectSummary[] {
  const bySubject = new Map<string, WeaknessRow[]>();
  rows.forEach((r) => {
    const arr = bySubject.get(r.subject) ?? [];
    arr.push(r);
    bySubject.set(r.subject, arr);
  });

  return Array.from(bySubject.entries()).map(([subject, subjectRows]) => {
    const totalAttempts = subjectRows.reduce((sum, r) => sum + r.total_attempts, 0);
    const totalCorrect = subjectRows.reduce((sum, r) => sum + r.correct_attempts, 0);
    const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 1000) / 10 : 0;

    const needsReview = subjectRows
      .filter((r) => (r.accuracy_pct ?? 0) < 60)
      .sort((a, b) => (a.accuracy_pct ?? 0) - (b.accuracy_pct ?? 0));

    return { subject, totalAttempts, overallAccuracy, needsReview };
  });
}

export default function WeaknessMapPage() {
  const [rows, setRows] = useState<WeaknessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/attempts")
      .then((res) => {
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        return res.json();
      })
      .then((data: WeaknessRow[]) => setRows(data))
      .catch(() => setErrorMsg("โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชหน้าใหม่"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink}>← กลับหน้าหลัก</Link>
      <h2>Weakness Map — ภาพรวมความแม่นยำและความมั่นใจ</h2>

      {loading && <p>กำลังโหลดข้อมูล...</p>}
      {errorMsg && <p style={{ color: "#dc2626" }}>{errorMsg}</p>}

      {!loading && !errorMsg && rows.length === 0 && (
        <p>ยังไม่มีข้อมูลการทำโจทย์ — ลองไปทำแบบทดสอบสักชุดก่อน แล้วกลับมาดูหน้านี้อีกครั้ง</p>
      )}

      {!loading && !errorMsg && rows.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12 }}>สรุปรายวิชา</h3>
          <div style={styles.summaryGrid}>
            {summarizeBySubject(rows).map((s) => (
              <div key={s.subject} style={styles.summaryCard}>
                <div style={{ fontWeight: 600 }}>{SUBJECT_TITLES[s.subject] ?? s.subject}</div>
                <div style={styles.summaryAccuracy}>
                  {s.overallAccuracy}%
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#6b7280", marginLeft: 6 }}>
                    ({s.totalAttempts} ครั้งที่ทำ)
                  </span>
                </div>
                {s.needsReview.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#16a34a" }}>ยังไม่มีจุดอ่อนที่ต้องเร่งแก้</p>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>ควรไปเรียนรู้เพิ่ม:</p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                      {s.needsReview.slice(0, 5).map((r) => (
                        <li key={r.topic}>
                          {r.topic} ({r.accuracy_pct}%)
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 12 }}>รายละเอียดทุกหัวข้อ</h3>
          <div style={styles.legend}>
            <span><span style={legendDotStyle("#dc2626")} />มั่นใจเกินจริง</span>
            <span><span style={legendDotStyle("#ea580c")} />จุดอ่อนที่ต้องฝึกเพิ่ม</span>
            <span><span style={legendDotStyle("#2563eb")} />ไม่มั่นใจแต่ทำได้ดี</span>
            <span><span style={legendDotStyle("#16a34a")} />อยู่ในเกณฑ์ดี</span>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>วิชา</th>
                <th style={styles.th}>หัวข้อ</th>
                <th style={styles.th}>จำนวนครั้งที่ทำ</th>
                <th style={styles.th}>ความแม่นยำ</th>
                <th style={styles.th}>ความมั่นใจเฉลี่ย (1-4)</th>
                <th style={styles.th}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const status = rowStatus(row);
                return (
                  <tr key={`${row.subject}-${row.topic}`} style={{ background: status.bg }}>
                    <td style={styles.td}>{SUBJECT_TITLES[row.subject] ?? row.subject}</td>
                    <td style={styles.td}>{row.topic}</td>
                    <td style={styles.td}>{row.total_attempts}</td>
                    <td style={styles.td}>{row.accuracy_pct ?? "-"}%</td>
                    <td style={styles.td}>{row.avg_confidence ?? "-"}</td>
                    <td style={styles.td}>
                      <span style={legendDotStyle(status.dot)} />
                      {status.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
