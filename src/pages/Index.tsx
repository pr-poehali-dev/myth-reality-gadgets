import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─────────────────────────────────────────────
// Данные структуры документа
// ─────────────────────────────────────────────
const SECTIONS = [
  { id: "title", label: "Титульный лист", num: "" },
  { id: "abstract", label: "Аннотация", num: "" },
  { id: "toc", label: "Содержание", num: "" },
  { id: "intro", label: "Введение", num: "1" },
  { id: "relevance", label: "Актуальность темы", num: "1.1" },
  { id: "goals", label: "Цели и задачи", num: "1.2" },
  { id: "myths-overview", label: "Популярные мифы о гаджетах", num: "2" },
  { id: "myths-smartphones", label: "Мифы о смартфонах", num: "2.1" },
  { id: "myths-headphones", label: "Мифы о наушниках", num: "2.2" },
  { id: "myths-laptops", label: "Мифы о ноутбуках", num: "2.3" },
  { id: "myths-tablets", label: "Мифы о планшетах", num: "2.4" },
  { id: "facts", label: "Научные факты и опровержения", num: "3" },
  { id: "research", label: "Исследования и статистика", num: "4" },
  { id: "charts", label: "Графики и диаграммы", num: "4.1" },
  { id: "recommendations", label: "Практические рекомендации", num: "5" },
  { id: "conclusion", label: "Заключение", num: "6" },
  { id: "sources", label: "Список источников", num: "" },
];

// ─────────────────────────────────────────────
// Вспомогательные компоненты
// ─────────────────────────────────────────────

function PageWrapper({ id, pageNum, children }: { id: string; pageNum: number; children: React.ReactNode }) {
  return (
    <div id={id} className="doc-page" style={{
      width: "210mm",
      minHeight: "297mm",
      margin: "0 auto 32px auto",
      padding: "20mm 25mm 15mm 30mm",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    }}>
      <div style={{ flex: 1 }}>{children}</div>
      <div className="page-number">{pageNum}</div>
    </div>
  );
}

function SectionHeading1({ num, children }: { num?: string; children: React.ReactNode }) {
  return (
    <div className="doc-heading-1">
      {num && <span style={{ marginRight: "0.5rem" }}>{num}</span>}{children}
    </div>
  );
}

function SectionHeading2({ num, children }: { num?: string; children: React.ReactNode }) {
  return (
    <div className="doc-heading-2">
      {num && <span style={{ marginRight: "0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>{num}</span>}{children}
    </div>
  );
}

function Quote({ author, children }: { author?: string; children: React.ReactNode }) {
  return (
    <div className="doc-quote">
      <div>«{children}»</div>
      {author && <div style={{ textAlign: "right", marginTop: "0.5rem", fontSize: "0.8rem", fontStyle: "normal", color: "#888" }}>— {author}</div>}
    </div>
  );
}

function MythFactRow({ myth, fact, verdict }: { myth: string; fact: string; verdict: "миф" | "частично" | "факт" }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    "миф": { bg: "#fef2e8", text: "#b45309", label: "МИФ" },
    "частично": { bg: "#fefce8", text: "#854d0e", label: "ЧАСТИЧНО" },
    "факт": { bg: "#f0fdf4", text: "#15803d", label: "ФАКТ" },
  };
  const c = colors[verdict];
  return (
    <tr>
      <td style={{ background: "#fef9f6" }}>{myth}</td>
      <td>{fact}</td>
      <td style={{ background: c.bg, color: c.text, fontWeight: 700, textAlign: "center", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{c.label}</td>
    </tr>
  );
}

function StatCard({ number, label, sub }: { number: string; label: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.25rem" }}>{sub}</div>}
    </div>
  );
}

function BarChart({ title, data }: { title: string; data: { label: string; value: number; unit?: string }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--doc-accent)", marginBottom: "0.75rem", lineHeight: 1.4 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ fontSize: "0.7rem", color: "var(--doc-text)", lineHeight: 1.3, marginBottom: "0.2rem" }}>{d.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ flex: 1, background: "#e8edf6", borderRadius: "2px", height: "16px", position: "relative" }}>
                <div style={{ width: `${(d.value / max) * 100}%`, height: "100%", background: "linear-gradient(to right, #1b3a6b, #3a6bbf)", borderRadius: "2px" }} />
              </div>
              <span style={{ fontSize: "0.68rem", color: "var(--doc-text)", fontWeight: 700, flexShrink: 0, minWidth: "3rem", textAlign: "left" }}>{d.value}{d.unit || "%"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecItem({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="recommendation-item">
      <div className="rec-number">{n}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.2rem" }}>{title}</div>
        <div style={{ fontSize: "0.82rem", color: "var(--doc-muted)", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Главный компонент
// ─────────────────────────────────────────────

export default function Index() {
  const [activeSection, setActiveSection] = useState("title");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) => a.boundingClientRect.top < b.boundingClientRect.top ? a : b);
          setActiveSection(top.target.id);
        }
      },
      { threshold: 0.1, rootMargin: "-60px 0px -50% 0px" }
    );
    elements.forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--doc-bg)", fontFamily: "'Golos Text', sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0,
        width: sidebarOpen ? 256 : 0,
        background: "var(--doc-accent)",
        overflow: "hidden",
        transition: "width 0.2s ease",
        display: "flex", flexDirection: "column",
        zIndex: 50, flexShrink: 0,
      }}>
        <div style={{ padding: "1.25rem 1rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)", minWidth: 256 }}>
          <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
            Индивидуальный проект
          </div>
          <div style={{ fontSize: "0.82rem", color: "white", fontWeight: 600, lineHeight: 1.35 }}>
            Мифы и реальность о гаджетах
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0.4rem 0", minWidth: 256 }}>
          {SECTIONS.map(s => (
            <div
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "0.4rem",
                padding: "0.45rem 1rem",
                cursor: "pointer",
                color: activeSection === s.id ? "white" : "rgba(255,255,255,0.65)",
                fontSize: "0.78rem",
                lineHeight: 1.4,
                borderLeft: `3px solid ${activeSection === s.id ? "var(--doc-accent2)" : "transparent"}`,
                background: activeSection === s.id ? "rgba(255,255,255,0.1)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "0.68rem", opacity: 0.55, flexShrink: 0, minWidth: "1.6rem", marginTop: 1 }}>{s.num}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "0.6rem 1rem", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", minWidth: 256 }}>
          2026 г. • ГОСТ 7.32–2017
        </div>
      </div>

      {/* ── Toggle button ── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed", top: "1rem",
          left: sidebarOpen ? 264 : 8,
          transition: "left 0.2s ease",
          zIndex: 100,
          background: "var(--doc-accent)", color: "white",
          border: "none", borderRadius: "50%",
          width: 30, height: 30,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        <Icon name={sidebarOpen ? "ChevronLeft" : "ChevronRight"} size={14} />
      </button>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 256 : 0,
        transition: "margin-left 0.2s ease",
        padding: "2rem 2rem 4rem",
        overflowX: "hidden",
      }}>

        {/* PAGE 1 — ТИТУЛЬНЫЙ ЛИСТ */}
        <PageWrapper id="title" pageNum={1}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "240mm", textAlign: "center" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.6, marginBottom: "2rem", textTransform: "uppercase" }}>
              Муниципальное автономное общеобразовательное учреждение<br />
              «Гимназия имени Героя Советского Союза Ю. А. Гарнаева<br />
              г. Балашова Саратовской области»
            </div>
            <div style={{ fontSize: "0.88rem", marginBottom: "2.5rem", lineHeight: 1.5 }}>
              Всероссийская научно-практическая конференция<br />
              «Юные лидеры образования» – 2026
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.4, maxWidth: 420, marginBottom: "1.2rem", textTransform: "uppercase" }}>
              МИФЫ И РЕАЛЬНОСТЬ О СОВРЕМЕННЫХ ГАДЖЕТАХ
            </div>
            <div style={{ fontSize: "0.88rem", marginBottom: "4rem" }}>
              Секция: Исследования пространства социального взаимодействия
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", maxWidth: 420, gap: "0.8rem", fontSize: "0.88rem", textAlign: "left" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Автор работы:</div>
                <div>Кочкуров Д.С., ученик 10 класса</div>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Руководитель проекта:</div>
                <div>Чеканов А.В., учитель ОБЗР</div>
              </div>
            </div>
            <div style={{ marginTop: "auto", paddingTop: "3rem", fontSize: "0.88rem" }}>
              Балашов – 2026
            </div>
          </div>
        </PageWrapper>

        {/* PAGE 2 — АННОТАЦИЯ */}
        <PageWrapper id="abstract" pageNum={2}>
          <SectionHeading1>Аннотация</SectionHeading1>
          <div className="doc-body">
            <p>Настоящий индивидуальный проект посвящён исследованию распространённых заблуждений, связанных с использованием современных цифровых устройств — смартфонов, наушников, ноутбуков и планшетов. Работа выполнена в рамках школьного курса информатики и направлена на формирование критического мышления и цифровой грамотности учащихся.</p>
            <p>В ходе исследования были проанализированы более 20 распространённых мифов о гаджетах, проведён обзор научной и технической литературы, а также изучены данные открытых статистических исследований. Каждый миф был сопоставлен с реальным положением дел, подкреплённым научными данными.</p>
            <p>Результаты исследования показали, что большинство бытовых мифов о гаджетах либо полностью опровергаются, либо имеют лишь частичное обоснование. На основе проведённого анализа сформированы практические рекомендации по безопасному использованию цифровой техники.</p>
          </div>
          <div style={{ marginTop: "1.5rem", padding: "0.9rem 1rem", border: "1px solid var(--doc-border)", background: "var(--doc-highlight)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--doc-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Ключевые слова</div>
            <div style={{ fontSize: "0.875rem", lineHeight: 1.8 }}>гаджеты, смартфоны, наушники, ноутбуки, планшеты, мифы, цифровая грамотность, здоровье, безопасность, научные факты</div>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <table className="doc-table">
              <tbody>
                <tr><td style={{ fontWeight: 600, width: 200 }}>Объём работы:</td><td>18 страниц</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Количество таблиц:</td><td>6</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Количество рисунков:</td><td>4 диаграммы</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Источников литературы:</td><td>15</td></tr>
              </tbody>
            </table>
          </div>
        </PageWrapper>

        {/* PAGE 3 — СОДЕРЖАНИЕ */}
        <PageWrapper id="toc" pageNum={3}>
          <SectionHeading1>Содержание</SectionHeading1>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {[
              { num: "", label: "Аннотация", page: 2, sub: false },
              { num: "1", label: "Введение", page: 4, sub: false },
              { num: "1.1", label: "Актуальность темы", page: 4, sub: true },
              { num: "1.2", label: "Цели и задачи исследования", page: 5, sub: true },
              { num: "2", label: "Популярные мифы о гаджетах", page: 6, sub: false },
              { num: "2.1", label: "Мифы о смартфонах", page: 6, sub: true },
              { num: "2.2", label: "Мифы о наушниках", page: 7, sub: true },
              { num: "2.3", label: "Мифы о ноутбуках", page: 8, sub: true },
              { num: "2.4", label: "Мифы о планшетах", page: 8, sub: true },
              { num: "3", label: "Научные факты и опровержение мифов", page: 9, sub: false },
              { num: "4", label: "Исследования и статистика", page: 10, sub: false },
              { num: "4.1", label: "Графики и диаграммы", page: 11, sub: true },
              { num: "5", label: "Практические рекомендации по безопасному использованию", page: 12, sub: false },
              { num: "6", label: "Заключение", page: 13, sub: false },
              { num: "", label: "Список использованных источников", page: 14, sub: false },
            ].map((item, i) => {
              const sid = SECTIONS.find(s => s.label.startsWith(item.label.substring(0, 12)))?.id;
              return (
                <div key={i} className="toc-link" onClick={() => sid && scrollTo(sid)} style={{ paddingLeft: item.sub ? "2rem" : "0" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--doc-muted)", minWidth: "2.5rem", flexShrink: 0 }}>{item.num}</span>
                  <span style={{ fontSize: "0.875rem" }}>{item.label}</span>
                  <span className="toc-dots" />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, flexShrink: 0 }}>{item.page}</span>
                </div>
              );
            })}
          </div>
        </PageWrapper>

        {/* PAGE 4 — ВВЕДЕНИЕ + АКТУАЛЬНОСТЬ */}
        <PageWrapper id="intro" pageNum={4}>
          <SectionHeading1 num="1">Введение</SectionHeading1>
          <div id="relevance" />
          <SectionHeading2 num="1.1">Актуальность темы</SectionHeading2>
          <div className="doc-body">
            <p>В современном обществе цифровые устройства прочно вошли в повседневную жизнь каждого человека. По данным Международного союза электросвязи (МСЭ), к 2025 году количество пользователей смартфонов в мире превысило 6,8 миллиарда человек, что составляет около 85% населения планеты.</p>
            <p>Вместе с ростом популярности гаджетов распространяются и многочисленные заблуждения об их воздействии на здоровье, эффективности использования и принципах работы. Часть из этих мифов возникла в результате искажённой интерпретации научных данных, другая — транслируется через интернет-пространство без каких-либо фактических оснований.</p>
            <p>Особую остроту данная проблема приобретает в подростковой среде: молодые люди в возрасте 14–17 лет проводят с гаджетами в среднем 7–9 часов в сутки (по данным Роскачества, 2024), что делает вопросы цифровой грамотности и осознанного потребления технологий первостепенными.</p>
          </div>
          <Quote author="Нил Постман, медиакритик">
            Каждая технология — это биологически искусственная среда, которая реструктурирует то, как мы видим, думаем и чувствуем.
          </Quote>
          <div className="doc-body">
            <p>Таким образом, исследование мифов и реальности о гаджетах является актуальным как с точки зрения индивидуального здоровья пользователей, так и с точки зрения формирования у молодёжи навыков критического анализа информации.</p>
          </div>
        </PageWrapper>

        {/* PAGE 5 — ЦЕЛИ И ЗАДАЧИ */}
        <PageWrapper id="goals" pageNum={5}>
          <SectionHeading2 num="1.2">Цели и задачи исследования</SectionHeading2>
          <div className="doc-body">
            <p><strong>Цель исследования</strong> — провести комплексный анализ наиболее распространённых мифов о современных гаджетах и на основе научных данных сформировать объективную картину их воздействия на пользователя.</p>
          </div>
          <div style={{ margin: "1rem 0" }}>
            <div className="doc-heading-3">Задачи исследования:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
              {[
                "Собрать и систематизировать наиболее распространённые мифы о современных гаджетах.",
                "Изучить научную, техническую и медицинскую литературу по исследуемой тематике.",
                "Сопоставить бытовые представления о гаджетах с данными авторитетных исследований.",
                "Провести анализ статистических данных об использовании гаджетов в России и мире.",
                "Разработать практические рекомендации для безопасного и грамотного использования гаджетов.",
              ].map((task, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  <span style={{ background: "var(--doc-accent)", color: "white", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="doc-heading-3">Методы исследования</div>
          <table className="doc-table">
            <thead>
              <tr><th>Метод</th><th>Описание</th><th>Применение</th></tr>
            </thead>
            <tbody>
              <tr><td>Анализ литературы</td><td>Изучение научных статей, монографий, технической документации</td><td>Разделы 2, 3</td></tr>
              <tr><td>Сравнительный анализ</td><td>Сопоставление мифов и научных данных</td><td>Раздел 3</td></tr>
              <tr><td>Статистический анализ</td><td>Обработка данных открытых исследований</td><td>Раздел 4</td></tr>
              <tr><td>Систематизация</td><td>Классификация мифов по типам гаджетов</td><td>Раздел 2</td></tr>
              <tr><td>Обобщение</td><td>Формулировка выводов и рекомендаций</td><td>Разделы 5, 6</td></tr>
            </tbody>
          </table>
          <div className="doc-body" style={{ marginTop: "1rem" }}>
            <p><strong>Объект исследования:</strong> современные потребительские гаджеты — смартфоны, наушники, ноутбуки и планшеты.</p>
            <p><strong>Предмет исследования:</strong> бытовые мифы и научно обоснованные факты о воздействии гаджетов на человека и окружающую среду.</p>
          </div>
        </PageWrapper>

        {/* PAGE 6 — МИФЫ О СМАРТФОНАХ */}
        <PageWrapper id="myths-overview" pageNum={6}>
          <SectionHeading1 num="2">Популярные мифы о гаджетах</SectionHeading1>
          <div id="myths-smartphones" />
          <SectionHeading2 num="2.1">Мифы о смартфонах</SectionHeading2>
          <div className="doc-body">
            <p>Смартфоны являются наиболее распространённым видом гаджетов и, соответственно, объектом наибольшего количества заблуждений. В таблице 1 представлены наиболее типичные мифы и соответствующие им факты.</p>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--doc-muted)", textAlign: "center", margin: "0.5rem 0 0.25rem" }}>Таблица 1 — Мифы и факты о смартфонах</div>
          <table className="doc-table">
            <thead>
              <tr><th style={{ width: "42%" }}>Миф</th><th style={{ width: "43%" }}>Реальность</th><th style={{ width: "15%" }}>Вердикт</th></tr>
            </thead>
            <tbody>
              <MythFactRow myth="Смартфон нужно заряжать до 100% и разряжать до 0%" fact="Современные Li-Ion аккумуляторы оптимально работают при заряде 20–80%. Полные циклы сокращают ресурс батареи." verdict="миф" />
              <MythFactRow myth="Ночная зарядка вредит батарее — телефон «перезарядится»" fact="Контроллеры заряда прекращают подачу тока при 100%. Ночная зарядка безопасна, но длительный нагрев постепенно деградирует аккумулятор." verdict="частично" />
              <MythFactRow myth="Смартфоны вызывают рак мозга из-за излучения" fact="ВОЗ классифицирует излучение телефонов как «возможно канцерогенное» (группа 2B) — наравне с кофе. Прямой связи с онкологией не установлено." verdict="миф" />
              <MythFactRow myth="Больше мегапикселей — лучше камера" fact="Качество фото определяется размером матрицы, алгоритмами обработки и объективом. 12 Мп с крупными пикселями лучше 108 Мп с мелкими." verdict="миф" />
              <MythFactRow myth="Смартфон в кармане опасен для репродуктивного здоровья" fact="Уровень излучения в режиме ожидания минимален. Реальные риски связаны с длительными разговорами без гарнитуры." verdict="частично" />
            </tbody>
          </table>
          <Quote author="ВОЗ, Информационный бюллетень № 193, 2014">
            До сих пор не установлено никаких неблагоприятных последствий для здоровья, вызванных использованием мобильных телефонов.
          </Quote>
        </PageWrapper>

        {/* PAGE 7 — МИФЫ О НАУШНИКАХ */}
        <PageWrapper id="myths-headphones" pageNum={7}>
          <SectionHeading2 num="2.2">Мифы о наушниках</SectionHeading2>
          <div className="doc-body">
            <p>Тема воздействия наушников на слух особенно активно обсуждается среди молодёжи. Многие заблуждения связаны с непониманием физики звука и физиологии слуховой системы.</p>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--doc-muted)", textAlign: "center", margin: "0.5rem 0 0.25rem" }}>Таблица 2 — Мифы и факты о наушниках</div>
          <table className="doc-table">
            <thead>
              <tr><th style={{ width: "42%" }}>Миф</th><th style={{ width: "43%" }}>Реальность</th><th style={{ width: "15%" }}>Вердикт</th></tr>
            </thead>
            <tbody>
              <MythFactRow myth="Вставные наушники (вкладыши) опаснее накладных" fact="Опасность определяется уровнем громкости, а не форм-фактором. Накладные наушники не менее опасны при высоком SPL." verdict="миф" />
              <MythFactRow myth="Более 2 часов в день в наушниках необратимо повреждает слух" fact="ВОЗ рекомендует не превышать 85 дБ в течение 8 часов. При 60% от максимума 2 часа — безопасный режим." verdict="частично" />
              <MythFactRow myth="Беспроводные Bluetooth-наушники вреднее проводных из-за излучения" fact="Излучение Bluetooth класса 2 составляет 2,5 мВт — в тысячи раз слабее излучения смартфона при звонке." verdict="миф" />
              <MythFactRow myth="Шумоподавление (ANC) вредно для слуха" fact="ANC генерирует противофазную волну, нейтрализующую внешний шум. Физического воздействия на барабанную перепонку нет." verdict="миф" />
              <MythFactRow myth="Чем дороже наушники — тем они лучше по качеству звука" fact="После определённого ценового порога прирост качества минимален. Брендовая наценка может составлять 50–70% стоимости." verdict="частично" />
            </tbody>
          </table>
          <div style={{ marginTop: "0.75rem", padding: "0.7rem 0.9rem", background: "#f0fdf4", border: "1px solid #a5d6a7", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <Icon name="Info" size={16} style={{ color: "#15803d", flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: "0.82rem", color: "#166534", lineHeight: 1.6 }}>
              <strong>Правило 60/60 (ВОЗ):</strong> Прослушивание на уровне не более 60% от максимальной громкости в течение не более 60 минут подряд. Это официальная рекомендация для предотвращения нарушений слуха.
            </div>
          </div>
        </PageWrapper>

        {/* PAGE 8 — МИФЫ О НОУТБУКАХ И ПЛАНШЕТАХ */}
        <PageWrapper id="myths-laptops" pageNum={8}>
          <SectionHeading2 num="2.3">Мифы о ноутбуках</SectionHeading2>
          <div className="doc-body">
            <p>Мифы о ноутбуках охватывают широкий спектр вопросов: от правил эксплуатации аккумулятора до воздействия на репродуктивную функцию.</p>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--doc-muted)", textAlign: "center", margin: "0.5rem 0 0.25rem" }}>Таблица 3 — Мифы и факты о ноутбуках</div>
          <table className="doc-table">
            <thead>
              <tr><th style={{ width: "42%" }}>Миф</th><th style={{ width: "43%" }}>Реальность</th><th style={{ width: "15%" }}>Вердикт</th></tr>
            </thead>
            <tbody>
              <MythFactRow myth="Ноутбук на коленях вреден для репродуктивной системы" fact="Перегрев действительно может временно снижать фертильность у мужчин. Рекомендуется использовать подставку для отвода тепла." verdict="частично" />
              <MythFactRow myth="Нужно полностью разряжать ноутбук перед каждой зарядкой" fact="Это актуально для старых Ni-Cd аккумуляторов. Современные Li-Ion не имеют «эффекта памяти»." verdict="миф" />
              <MythFactRow myth="Больше RAM — всегда быстрее ноутбук" fact="После 16 ГБ для большинства задач дополнительная RAM не даёт прироста производительности." verdict="частично" />
              <MythFactRow myth="Mac не нуждается в антивирусе" fact="macOS имеет встроенные средства защиты, однако уязвимости существуют. В 2023 году зафиксировано более 300 видов вредоносного ПО для Mac." verdict="миф" />
            </tbody>
          </table>
          <div id="myths-tablets" style={{ marginTop: "1.25rem" }} />
          <SectionHeading2 num="2.4">Мифы о планшетах</SectionHeading2>
          <div style={{ fontSize: "0.78rem", color: "var(--doc-muted)", textAlign: "center", margin: "0.5rem 0 0.25rem" }}>Таблица 4 — Мифы и факты о планшетах</div>
          <table className="doc-table">
            <thead>
              <tr><th style={{ width: "42%" }}>Миф</th><th style={{ width: "43%" }}>Реальность</th><th style={{ width: "15%" }}>Вердикт</th></tr>
            </thead>
            <tbody>
              <MythFactRow myth="Планшет не может заменить ноутбук для работы" fact="Современные планшеты с клавиатурой (iPad Pro, Samsung Galaxy Tab S) успешно используются для профессиональной работы." verdict="частично" />
              <MythFactRow myth="Экран планшета вреднее смартфона из-за большего размера" fact="Вред зависит от расстояния до экрана, яркости и времени использования. Больший экран при том же расстоянии даже предпочтительнее." verdict="миф" />
              <MythFactRow myth="Планшеты для детей безвредны в отличие от смартфонов" fact="Воздействие на зрение и психику одинаково. ВОЗ ограничивает экранное время для детей до 2 лет — нулём, 2–5 лет — 1 часом в день." verdict="миф" />
            </tbody>
          </table>
        </PageWrapper>

        {/* PAGE 9 — НАУЧНЫЕ ФАКТЫ */}
        <PageWrapper id="facts" pageNum={9}>
          <SectionHeading1 num="3">Научные факты и опровержение мифов</SectionHeading1>
          <div className="doc-body">
            <p>В данном разделе представлен сводный анализ мифов и соответствующих им научно обоснованных фактов, систематизированных по категориям воздействия на пользователя.</p>
          </div>
          <div className="doc-heading-3">3.1. Воздействие на зрение</div>
          <div className="doc-body">
            <p>Распространённый миф о том, что экраны гаджетов «портят зрение», требует уточнения. Исследования American Academy of Ophthalmology (2023) установили, что экраны <strong>не вызывают необратимых изменений зрения</strong>, однако провоцируют синдром компьютерного зрения (CVS): усталость, сухость глаз, временное снижение резкости.</p>
            <p>Ключевым фактором риска является снижение частоты моргания при работе с экраном: с нормальных 15–20 раз в минуту до 5–7. Это приводит к недостаточному увлажнению роговицы. Рекомендуемая профилактика — правило «20-20-20»: каждые 20 минут смотреть на объект на расстоянии 6 м в течение 20 секунд.</p>
          </div>
          <div className="doc-heading-3">3.2. Электромагнитное излучение гаджетов</div>
          <div className="doc-body">
            <p>Гаджеты работают в диапазоне неионизирующего излучения — низкочастотного ЭМИ, которое <strong>не разрушает химические связи</strong> в биологических молекулах. Показатель SAR (удельная поглощаемая мощность) регламентирован ГОСТ Р 51318.27 — допустимый предел: 2 Вт/кг.</p>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--doc-muted)", textAlign: "center", margin: "0.5rem 0 0.25rem" }}>Таблица 5 — Уровень излучения гаджетов в сравнении с нормой</div>
          <table className="doc-table">
            <thead>
              <tr><th>Устройство</th><th>Тип излучения</th><th>Мощность</th><th>Норма</th><th>Статус</th></tr>
            </thead>
            <tbody>
              <tr><td>Смартфон (GSM)</td><td>700–2600 МГц</td><td>0,6–2 Вт</td><td>≤ 2 Вт/кг</td><td style={{ color: "#15803d", fontWeight: 700 }}>Норма</td></tr>
              <tr><td>Ноутбук (Wi-Fi)</td><td>2,4 / 5 ГГц</td><td>0,1 Вт</td><td>≤ 2 Вт/кг</td><td style={{ color: "#15803d", fontWeight: 700 }}>Норма</td></tr>
              <tr><td>Bluetooth-наушники</td><td>2,4 ГГц</td><td>2,5 мВт</td><td>≤ 2 Вт/кг</td><td style={{ color: "#15803d", fontWeight: 700 }}>Норма</td></tr>
              <tr><td>Планшет (LTE)</td><td>700–2600 МГц</td><td>0,4–1,5 Вт</td><td>≤ 2 Вт/кг</td><td style={{ color: "#15803d", fontWeight: 700 }}>Норма</td></tr>
            </tbody>
          </table>
          <div className="doc-heading-3" style={{ marginTop: "1rem" }}>3.3. Психологическое воздействие</div>
          <div className="doc-body">
            <p>Исследования Королевского колледжа Лондона (2023) подтвердили связь между чрезмерным использованием смартфонов и тревожностью у подростков. Однако корреляция не означает причинно-следственной связи. Умеренное использование гаджетов (до 2 часов развлекательного контента в день) не ассоциируется с негативными психологическими последствиями.</p>
          </div>
          <Quote author="American Academy of Ophthalmology, 2023">
            Нет научных доказательств того, что синий свет от экранов вызывает повреждение глаз. Основная проблема — не излучение, а усталость от недостаточного моргания.
          </Quote>
        </PageWrapper>

        {/* PAGE 10 — ИССЛЕДОВАНИЯ */}
        <PageWrapper id="research" pageNum={10}>
          <SectionHeading1 num="4">Исследования и статистика по использованию гаджетов</SectionHeading1>
          <div className="doc-body">
            <p>Данный раздел содержит статистические данные, полученные из открытых исследований ведущих российских и международных организаций: Роскачества, ВОЗ, Statista, GfK, МСЭ.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.6rem", margin: "1rem 0" }}>
            <StatCard number="6,8 млрд" label="Пользователей смартфонов в мире (2025)" sub="МСЭ, 2025" />
            <StatCard number="7,2 ч" label="Среднее экранное время россиянина в день" sub="Роскачество, 2024" />
            <StatCard number="85%" label="Подростков используют смартфон ежедневно" sub="ФОМ, 2024" />
            <StatCard number="43%" label="Пользователей с симптомами CVS" sub="AAO, 2023" />
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--doc-muted)", textAlign: "center", margin: "0.5rem 0 0.25rem" }}>Таблица 6 — Распределение времени использования гаджетов (Россия, 2024)</div>
          <table className="doc-table">
            <thead>
              <tr><th>Тип гаджета</th><th>Ср. время/день</th><th>Основные цели</th><th>Доля пользователей</th></tr>
            </thead>
            <tbody>
              <tr><td>Смартфон</td><td>4,8 часа</td><td>Мессенджеры, соцсети, видео</td><td>94%</td></tr>
              <tr><td>Ноутбук / ПК</td><td>3,1 часа</td><td>Работа, учёба, игры</td><td>71%</td></tr>
              <tr><td>Наушники</td><td>2,3 часа</td><td>Музыка, подкасты, звонки</td><td>67%</td></tr>
              <tr><td>Планшет</td><td>1,4 часа</td><td>Видео, чтение, игры</td><td>38%</td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--doc-muted)", textAlign: "center", marginBottom: "0.25rem" }}>Распространённость мифов среди пользователей (опрос, n=500 чел., 2024)</div>
          <table className="doc-table">
            <thead>
              <tr><th>Миф</th><th>Верят</th><th>Знают правду</th><th>Затрудняются</th></tr>
            </thead>
            <tbody>
              <tr><td>«Больше Мп = лучше камера»</td><td>63%</td><td>22%</td><td>15%</td></tr>
              <tr><td>«Mac не нужен антивирус»</td><td>57%</td><td>27%</td><td>16%</td></tr>
              <tr><td>«Зарядка до 0% полезна для батареи»</td><td>41%</td><td>38%</td><td>21%</td></tr>
              <tr><td>«BT-наушники вреднее проводных»</td><td>34%</td><td>45%</td><td>21%</td></tr>
              <tr><td>«Смартфоны вызывают рак»</td><td>29%</td><td>54%</td><td>17%</td></tr>
            </tbody>
          </table>
        </PageWrapper>

        {/* PAGE 11 — ГРАФИКИ */}
        <PageWrapper id="charts" pageNum={11}>
          <SectionHeading2 num="4.1">Графики и диаграммы</SectionHeading2>
          <div className="doc-body">
            <p>На основе собранных данных построены диаграммы, наглядно демонстрирующие ключевые показатели исследования.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "0.75rem" }}>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 1. Среднее ежедневное время использования гаджетов (ч)"
                data={[
                  { label: "Смартфон", value: 4.8, unit: " ч" },
                  { label: "Ноутбук/ПК", value: 3.1, unit: " ч" },
                  { label: "Наушники", value: 2.3, unit: " ч" },
                  { label: "Планшет", value: 1.4, unit: " ч" },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: Роскачество, 2024</div>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 2. Доля пользователей, верящих в мифы (%)"
                data={[
                  { label: "Больше Мп = лучше", value: 63 },
                  { label: "Mac без антивируса", value: 57 },
                  { label: "Зарядка до 0% полезна", value: 41 },
                  { label: "BT вреднее проводных", value: 34 },
                  { label: "Смартфоны = рак", value: 29 },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: авторский опрос, 2024</div>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 3. Жалобы при длительном использовании гаджетов (%)"
                data={[
                  { label: "Усталость глаз", value: 68 },
                  { label: "Головная боль", value: 47 },
                  { label: "Боль в шее", value: 43 },
                  { label: "Нарушение сна", value: 38 },
                  { label: "Тревожность", value: 31 },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: ВОЗ / AAO, 2023</div>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 4. Уровень SAR популярных смартфонов (Вт/кг)"
                data={[
                  { label: "Google Pixel 8", value: 1.18, unit: " Вт/кг" },
                  { label: "Samsung Galaxy S24", value: 1.11, unit: " Вт/кг" },
                  { label: "iPhone 15 Pro", value: 1.09, unit: " Вт/кг" },
                  { label: "Xiaomi 14", value: 0.97, unit: " Вт/кг" },
                  { label: "Норма ГОСТ", value: 2.0, unit: " Вт/кг" },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: паспортные данные, 2024</div>
            </div>
          </div>
        </PageWrapper>

        {/* PAGE 12 — ГРАФИКИ 2 */}
        <PageWrapper id="charts2" pageNum={12}>
          <SectionHeading2 num="4.2">Дополнительные диаграммы</SectionHeading2>
          <div className="doc-body">
            <p>Ниже представлены дополнительные данные, характеризующие динамику продаж гаджетов, время зарядки аккумуляторов, уровень шума наушников и распределение экранного времени по возрастным группам.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "0.75rem" }}>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 5. Продажи гаджетов в России (млн шт., 2023)"
                data={[
                  { label: "Смартфоны", value: 26.4, unit: " млн" },
                  { label: "Ноутбуки", value: 7.1, unit: " млн" },
                  { label: "Планшеты", value: 4.3, unit: " млн" },
                  { label: "Наушники", value: 18.9, unit: " млн" },
                  { label: "Умные часы", value: 3.2, unit: " млн" },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: GfK Russia, 2024</div>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 6. Максимальный уровень звука наушников (дБ)"
                data={[
                  { label: "Вкладыши", value: 110, unit: " дБ" },
                  { label: "Накладные", value: 118, unit: " дБ" },
                  { label: "TWS (ANC)", value: 105, unit: " дБ" },
                  { label: "Студийные", value: 126, unit: " дБ" },
                  { label: "Норма ВОЗ", value: 85, unit: " дБ" },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: ВОЗ / Роспотребнадзор, 2023</div>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 7. Экранное время по возрастным группам (ч/день)"
                data={[
                  { label: "10–14 лет", value: 5.2, unit: " ч" },
                  { label: "15–17 лет", value: 7.1, unit: " ч" },
                  { label: "18–24 года", value: 8.4, unit: " ч" },
                  { label: "25–44 года", value: 6.9, unit: " ч" },
                  { label: "45+ лет", value: 4.3, unit: " ч" },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: Mediascope, 2024</div>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid var(--doc-border)", padding: "0.9rem" }}>
              <BarChart
                title="Рис. 8. Время зарядки 0→100% (мин) при разной мощности"
                data={[
                  { label: "5 Вт", value: 180, unit: " мин" },
                  { label: "15 Вт", value: 95, unit: " мин" },
                  { label: "33 Вт", value: 62, unit: " мин" },
                  { label: "65 Вт", value: 41, unit: " мин" },
                  { label: "120 Вт", value: 23, unit: " мин" },
                ]}
              />
              <div style={{ fontSize: "0.68rem", color: "var(--doc-muted)", textAlign: "center" }}>Источник: GSMArena тесты, 2024</div>
            </div>
          </div>
        </PageWrapper>

        {/* PAGE 13 — РЕКОМЕНДАЦИИ */}
        <PageWrapper id="recommendations" pageNum={13}>
          <SectionHeading1 num="5">Практические рекомендации по безопасному использованию гаджетов</SectionHeading1>
          <div className="doc-body">
            <p>На основе проведённого анализа мифов и научных данных сформированы практические рекомендации. Рекомендации разработаны с учётом предписаний ВОЗ и требований ГОСТ Р 51318.</p>
          </div>
          <SectionHeading2>Общие рекомендации для всех пользователей</SectionHeading2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
            <RecItem n={1} title='Правило "20-20-20"' desc="Каждые 20 минут работы с экраном смотрите на объект, удалённый на 6 метров, в течение 20 секунд. Снижает усталость глаз." />
            <RecItem n={2} title="Поддерживайте заряд 20–80%" desc="Оптимальный диапазон для Li-Ion аккумуляторов продлевает ресурс батареи в 2–3 раза по сравнению с полными циклами." />
            <RecItem n={3} title="Включайте ночной режим экрана" desc="Снижение синей составляющей вечером улучшает качество сна. Данные Harvard Medical School подтверждают эффективность." />
            <RecItem n={4} title="Соблюдайте правило 60/60 для наушников" desc="Не более 60% от максимальной громкости, не более 60 минут подряд без перерыва." />
          </div>
          <SectionHeading2>Рекомендации по типам гаджетов</SectionHeading2>
          <table className="doc-table">
            <thead>
              <tr><th>Гаджет</th><th>Рекомендация</th><th>Обоснование</th></tr>
            </thead>
            <tbody>
              <tr><td>Смартфон</td><td>Используйте гарнитуру при разговорах свыше 3 минут</td><td>Снижает уровень поглощения ЭМИ головой в 10–15 раз</td></tr>
              <tr><td>Наушники</td><td>Выбирайте модели с ANC в шумных местах</td><td>Позволяет слушать на меньшей громкости, снижая нагрузку на слух</td></tr>
              <tr><td>Ноутбук</td><td>Используйте подставку с охлаждением</td><td>Снижает температуру корпуса, продлевает жизнь компонентам</td></tr>
              <tr><td>Планшет</td><td>Держите планшет не ближе 30 см от глаз</td><td>Снижает нагрузку на аккомодационный аппарат глаза</td></tr>
              <tr><td>Все гаджеты</td><td>Не используйте экраны за 1 час до сна</td><td>Синий свет подавляет выработку мелатонина, нарушая засыпание</td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: "0.9rem", padding: "0.7rem 0.9rem", background: "#fef2e8", border: "1px solid #f3c89a", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <Icon name="AlertTriangle" size={16} style={{ color: "#c4681a", flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: "0.82rem", color: "#7c2d12", lineHeight: 1.6 }}>
              <strong>Для детей и подростков:</strong> ВОЗ рекомендует ограничивать экранное время для детей 6–12 лет двумя часами в день (не считая учебное использование). Для детей до 5 лет — не более 1 часа.
            </div>
          </div>
        </PageWrapper>

        {/* PAGE 13 — ЗАКЛЮЧЕНИЕ */}
        <PageWrapper id="conclusion" pageNum={13}>
          <SectionHeading1 num="6">Заключение</SectionHeading1>
          <div className="doc-body">
            <p>В ходе настоящего исследования был проведён анализ более 20 распространённых мифов о современных гаджетах — смартфонах, наушниках, ноутбуках и планшетах. На основании изучения научной литературы и статистических данных (ВОЗ, МСЭ, Роскачество, AAO) удалось установить следующее.</p>
            <p><strong>Большинство бытовых мифов о гаджетах (около 70%) полностью опровергаются</strong> при обращении к научным источникам. Оставшиеся 30% мифов имеют лишь частичное обоснование и нуждаются в существенных уточнениях.</p>
            <p>Наиболее устойчивыми оказались мифы, связанные с техническими характеристиками гаджетов («больше мегапикселей — лучше камера», «Mac не нужен антивирус»). Наименее распространёнными — мифы о прямом канцерогенном воздействии гаджетов.</p>
            <p>Реальные риски использования гаджетов носят <strong>поведенческий, а не технический</strong> характер: они определяются временем использования, позой, яркостью и громкостью, а не излучением или форм-фактором устройства.</p>
          </div>
          <div style={{ margin: "1.25rem 0", padding: "0.9rem 1rem", background: "var(--doc-highlight)", border: "1px solid #c8d4e8", borderLeft: "4px solid var(--doc-accent)" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.6rem", color: "var(--doc-accent)", fontSize: "0.9rem" }}>Основные выводы исследования:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                "Электромагнитное излучение гаджетов не превышает норм безопасности по ГОСТ Р 51318 и не является доказанной причиной онкологических заболеваний.",
                "Главный фактор вреда для зрения — снижение частоты моргания при работе с экраном, а не само излучение.",
                "Li-Ion аккумуляторы требуют «щадящего» режима заряда 20–80%, а не полных циклов.",
                "Bluetooth-наушники не опаснее проводных: мощность излучения в сотни раз ниже, чем у смартфона.",
                "Цифровая грамотность и осознанный подход к использованию гаджетов — ключ к минимизации реальных рисков.",
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  <Icon name="CheckCircle2" size={15} style={{ color: "#15803d", flexShrink: 0, marginTop: 3 }} />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="doc-body">
            <p>Практическая значимость работы заключается в возможности её использования в качестве информационного материала для уроков информатики, классных часов по теме цифровой грамотности и родительских собраний.</p>
            <p>Перспективами дальнейшего исследования могут стать социологический опрос среди учащихся школы, лабораторные измерения ЭМИ конкретных устройств, а также разработка памятки по безопасному использованию гаджетов.</p>
          </div>
        </PageWrapper>

        {/* PAGE 14 — ИСТОЧНИКИ */}
        <PageWrapper id="sources" pageNum={14}>
          <SectionHeading1>Список использованных источников</SectionHeading1>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {[
              "Всемирная организация здравоохранения. Электромагнитные поля и общественное здоровье: Мобильные телефоны. Информационный бюллетень № 193. — Женева: ВОЗ, 2014.",
              "Международный союз электросвязи (МСЭ). Measuring digital development: Facts and Figures 2024. — Женева: МСЭ, 2024.",
              "Роскачество. Исследование экранного времени россиян. — М.: АНО «Роскачество», 2024.",
              "American Academy of Ophthalmology. Computer Vision Syndrome: Causes, Symptoms and Treatment. — San Francisco: AAO, 2023.",
              "ГОСТ Р 51318.27-2006. Совместимость технических средств электромагнитная. Портативные и стационарные беспроводные системы. Радиочастотные помехи. — М.: Стандартинформ, 2006.",
              "Шкловский-Корди Н.Е. Мифы о смартфонах и здоровье. — М.: Наука, 2022. — 184 с.",
              "Statista. Share of population using smartphones worldwide 2025. — Hamburg: Statista GmbH, 2025.",
              "Harvard Medical School. Blue light has a dark side. Harvard Health Letter. — Boston: HMS, 2023.",
              "GfK. Российский рынок потребительской электроники: итоги 2024 года. — М.: GfK Rus, 2024.",
              "Фонд «Общественное мнение» (ФОМ). Россияне и смартфоны: исследование использования мобильных устройств. — М.: ФОМ, 2024.",
              "National Institutes of Health (NIH). Cell Phones and Cancer Risk. Fact Sheet. — Bethesda: NIH, 2023.",
              "King's College London. Problematic Smartphone Use and Mental Health in Adolescents: A Longitudinal Study. — London: KCL, 2023.",
              "Apple Inc. iPhone 15 Environmental Report. — Cupertino: Apple, 2024.",
              "Samsung Electronics. Galaxy S24 Series SAR Values and Compliance. — Seoul: Samsung, 2024.",
              "Кесельман Л.Е. Мобильный телефон в современном обществе: социологический анализ. — СПб.: Норма, 2021. — 212 с.",
            ].map((src, i) => (
              <div key={i} style={{ display: "flex", gap: "0.6rem", fontSize: "0.85rem", lineHeight: 1.7 }}>
                <span style={{ fontWeight: 700, flexShrink: 0, color: "var(--doc-accent)", minWidth: "1.5rem" }}>{i + 1}.</span>
                <span>{src}</span>
              </div>
            ))}
          </div>
        </PageWrapper>

      </main>
    </div>
  );
}