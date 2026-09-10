-- ตารางคลังข้อสอบ
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,              -- math1 | phy | chem | bio
  section TEXT NOT NULL,
  topic TEXT NOT NULL,
  integrates_with TEXT DEFAULT '[]',  -- JSON array ของหัวข้อรอง
  difficulty TEXT DEFAULT 'medium',
  skill_measured TEXT,
  skill_type TEXT,                    -- เฉพาะเคมี: data_interpretation | quantitative
  diagram_type TEXT,                  -- เฉพาะฟิสิกส์: graph | circuit | force_diagram | none
  novel_scenario INTEGER DEFAULT 0,   -- เฉพาะชีวะ/โจทย์ประยุกต์: 0/1
  format TEXT NOT NULL,               -- mc5 | numeric | complex_choice
  question TEXT NOT NULL,
  choices TEXT,                       -- JSON array (สำหรับ mc5)
  answer TEXT,
  sub_items TEXT,                     -- JSON array (เฉพาะชีวะ เลือกตอบเชิงซ้อน)
  solution_steps TEXT DEFAULT '[]',   -- JSON array
  common_mistakes TEXT DEFAULT '[]',  -- JSON array
  identify_prompt TEXT,               -- คำถามแบบ A (วิเคราะห์ว่าใช้หัวข้อไหน)
  identify_choices TEXT,              -- JSON array
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON questions(subject, topic);

-- ตาราง log การทำโจทย์ทุกครั้ง (หัวใจของ Weakness Map)
CREATE TABLE IF NOT EXISTS attempts (
  attempt_id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  mode TEXT NOT NULL,                 -- identify | solve
  confidence_before INTEGER,          -- 1-4
  user_answer TEXT,
  correct INTEGER NOT NULL,           -- 0/1
  time_seconds INTEGER,
  error_level INTEGER,                -- 1-5 ใส่เฉพาะตอบผิด
  attempted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_subject ON attempts(subject);
