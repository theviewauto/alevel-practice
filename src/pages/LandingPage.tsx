import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Dna,
  FlaskConical,
  Gauge,
  Sparkles,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

type Subject = {
  id: string;
  title: string;
  code: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  topics: string[];
};

const subjects: Subject[] = [
  {
    id: "math1",
    title: "คณิตศาสตร์ประยุกต์ 1",
    code: "A-Level 61",
    description: "ฝึกคิดเป็นขั้นตอน ทำโจทย์แม่น และบริหารเวลาได้ดีขึ้น",
    icon: <Calculator size={30} />,
    color: "blue",
    topics: ["ฟังก์ชัน", "แคลคูลัส", "สถิติ", "ความน่าจะเป็น"],
  },
  {
    id: "phy",
    title: "ฟิสิกส์",
    code: "A-Level 64",
    description: "เข้าใจแรง กราฟ สมการ และการประยุกต์ใช้ในโจทย์จริง",
    icon: <Zap size={30} />,
    color: "purple",
    topics: ["กลศาสตร์", "คลื่น", "ไฟฟ้า", "ฟิสิกส์สมัยใหม่"],
  },
  {
    id: "chem",
    title: "เคมี",
    code: "A-Level 65",
    description: "เชื่อมแนวคิด สมการเคมี และการคำนวณอย่างเป็นระบบ",
    icon: <FlaskConical size={30} />,
    color: "orange",
    topics: ["โมล", "กรด-เบส", "สมดุล", "อินทรีย์เคมี"],
  },
  {
    id: "bio",
    title: "ชีววิทยา",
    code: "A-Level 66",
    description: "เข้าใจระบบชีวิต วิเคราะห์ข้อมูล และเชื่อมโยงเนื้อหา",
    icon: <Dna size={30} />,
    color: "green",
    topics: ["เซลล์", "พันธุศาสตร์", "ร่างกายมนุษย์", "นิเวศวิทยา"],
  },
];

function LandingPage() {
  const navigate = useNavigate();

  const chooseSubject = (subjectId: string) => {
    navigate(`/quiz/${subjectId}`);
  };

  return (
    <main>
      <nav className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">
            <BookOpenCheck size={22} />
          </span>
          <span>A-Level Practice</span>
        </a>

        <div className="nav-actions">
          <a href="#subjects">รายวิชา</a>
          <a href="#features">ฟีเจอร์</a>
          <Link to="/weakness">ผลการฝึก</Link>
          <button className="button button-outline">เข้าสู่ระบบ</button>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>ฝึกตรงจุด เพื่อคะแนนที่ดีขึ้น</span>
        </div>

        <h1>
          เตรียมสอบ A-Level
          <br />
          <span>อย่างมีแผนและวัดผลได้</span>
        </h1>

        <p className="hero-description">
          ฝึก คณิต 1 ฟิสิกส์ เคมี และชีววิทยา พร้อมเฉลยละเอียด
          วิเคราะห์จุดอ่อน และแผนทบทวนที่เหมาะกับคุณ
        </p>

        <div className="hero-actions">
          <a className="button button-primary" href="#subjects">
            เริ่มฝึกฟรี
            <ArrowRight size={19} />
          </a>
          <a className="button button-secondary" href="#features">
            ดูฟีเจอร์
          </a>
        </div>

        <div className="hero-stats">
          <div>
            <strong>4</strong>
            <span>วิชาหลัก</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>ใช้ฟรี</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>ฝึกได้ทุกเวลา</span>
          </div>
        </div>
      </section>

      <section id="subjects" className="section">
        <div className="section-heading">
          <p className="eyebrow">เลือกวิชาที่ต้องการฝึก</p>
          <h2>เริ่มจากจุดที่คุณอยากพัฒนา</h2>
          <p>
            ในเวอร์ชันถัดไป คุณจะเลือกเป้าหมายคะแนน ทำแบบทดสอบวัดระดับ
            และรับแผนฝึกเฉพาะตัวได้จากหน้านี้
          </p>
        </div>

        <div className="subject-grid">
          {subjects.map((subject) => (
            <article className={`subject-card ${subject.color}`} key={subject.id}>
              <div className="subject-card-top">
                <span className="subject-icon">{subject.icon}</span>
                <span className="subject-code">{subject.code}</span>
              </div>

              <h3>{subject.title}</h3>
              <p>{subject.description}</p>

              <div className="topic-list">
                {subject.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>

              <button
                className="subject-button"
                onClick={() => chooseSubject(subject.id)}
              >
                เริ่มฝึกวิชานี้
                <ArrowRight size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="section section-soft">
        <div className="section-heading">
          <p className="eyebrow">ระบบที่ออกแบบเพื่อการพัฒนา</p>
          <h2>ไม่ใช่แค่ทำข้อสอบ แต่รู้ว่าต้องฝึกอะไรต่อ</h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon blue-icon">
              <Gauge size={25} />
            </span>
            <h3>วิเคราะห์จุดอ่อน</h3>
            <p>แยกผลรายบท ระดับความยาก และประเภทข้อผิดพลาดของคุณ</p>
          </article>

          <article className="feature-card">
            <span className="feature-icon purple-icon">
              <Timer size={25} />
            </span>
            <h3>ฝึกจับเวลา</h3>
            <p>สร้างความคุ้นเคยกับการทำข้อสอบภายใต้เวลาที่จำกัด</p>
          </article>

          <article className="feature-card">
            <span className="feature-icon orange-icon">
              <CheckCircle2 size={25} />
            </span>
            <h3>เฉลยแบบสอนคิด</h3>
            <p>อธิบายวิธีทำทีละขั้น และชี้จุดที่มักทำให้เลือกคำตอบผิด</p>
          </article>

          <article className="feature-card">
            <span className="feature-icon green-icon">
              <TrendingUp size={25} />
            </span>
            <h3>ติดตามความก้าวหน้า</h3>
            <p>เห็นแนวโน้มคะแนน ความแม่นยำ และเรื่องที่ควรทบทวนต่อ</p>
          </article>
        </div>
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow light">เริ่มต้นได้ทันที</p>
          <h2>ฝึกให้ถูกจุด ก่อนวันสอบจริง</h2>
          <p>ทุกฟีเจอร์เปิดให้ใช้งานฟรี เพื่อช่วยให้ทุกคนเข้าถึงการฝึกที่มีคุณภาพ</p>
        </div>
        <a className="button button-light" href="#subjects">
          เลือกวิชาที่ต้องการฝึก
          <ArrowRight size={19} />
        </a>
      </section>

      <footer>
        <span>© 2026 A-Level Practice</span>
        <span>สร้างเพื่อการฝึกทำข้อสอบอย่างมีประสิทธิภาพ</span>
      </footer>
    </main>
  );
}

export default LandingPage;
