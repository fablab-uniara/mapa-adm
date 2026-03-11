import { useState, useMemo } from "react";

const disciplines = [
  { id: "com-exp", name: "Comunicação e Expressão", area: "Formação Básica", semester: 1, ch: 50, prereqs: [] },
  { id: "etica-crit", name: "Ética e Pensamento Crítico", area: "Formação Básica", semester: 1, ch: 50, prereqs: [] },
  { id: "informatica", name: "Informática", area: "Tecnologia e Inovação", semester: 1, ch: 75, prereqs: [] },
  { id: "dir-empre-inov", name: "Direito Aplicado ao Empreendedorismo e Inovação", area: "Direito e Legislação", semester: 1, ch: 50, prereqs: [] },
  { id: "cult-comp-emp", name: "Cultura e Comportamento Empreendedor", area: "Empreendedorismo", semester: 1, ch: 75, prereqs: [] },
  { id: "intro-eco", name: "Introdução à Economia", area: "Economia", semester: 1, ch: 50, prereqs: [] },
  { id: "novos-modelos", name: "Novos Modelos de Negócios na Era Digital", area: "Tecnologia e Inovação", semester: 1, ch: 50, prereqs: [] },
  { id: "psi-adm", name: "Psicologia Aplicada à Administração", area: "Gestão de Pessoas", semester: 1, ch: 50, prereqs: [] },
  { id: "ciencias-soc", name: "Ciências Sociais", area: "Formação Básica", semester: 1, ch: 50, prereqs: [] },
  { id: "comp-hum-org", name: "Comportamento Humano nas Organizações", area: "Gestão de Pessoas", semester: 2, ch: 50, prereqs: ["psi-adm"] },
  { id: "gestao-cont", name: "Gestão Contábil", area: "Finanças e Contabilidade", semester: 2, ch: 50, prereqs: [] },
  { id: "intro-adm", name: "Introdução a Administração", area: "Formação Básica", semester: 2, ch: 110, prereqs: [] },
  { id: "fund-mkt", name: "Fundamentos de Marketing", area: "Marketing", semester: 2, ch: 50, prereqs: [] },
  { id: "dir-emp-soc", name: "Introdução ao Direito Empresarial e Societário", area: "Direito e Legislação", semester: 2, ch: 50, prereqs: ["dir-empre-inov"] },
  { id: "mat-adm", name: "Matemática Aplicada à Administração", area: "Finanças e Contabilidade", semester: 2, ch: 110, prereqs: [] },
  { id: "microeco", name: "Microeconomia", area: "Economia", semester: 2, ch: 50, prereqs: ["intro-eco"] },
  { id: "soc-adm", name: "Sociologia Aplicada à Administração", area: "Formação Básica", semester: 2, ch: 50, prereqs: ["ciencias-soc"] },
  { id: "ext-proj1", name: "Atividades de Extensão / Projeto Integrador I", area: "Integração", semester: 2, ch: 90, prereqs: [] },
  { id: "adm-rec-pat1", name: "Adm. de Rec. Materiais e Patrimoniais I", area: "Operações", semester: 3, ch: 50, prereqs: ["intro-adm"] },
  { id: "cont1", name: "Contabilidade I", area: "Finanças e Contabilidade", semester: 3, ch: 75, prereqs: ["gestao-cont"] },
  { id: "estat1", name: "Estatística I", area: "Finanças e Contabilidade", semester: 3, ch: 50, prereqs: ["mat-adm"] },
  { id: "form-lid", name: "Formação de Líderes", area: "Gestão de Pessoas", semester: 3, ch: 75, prereqs: ["comp-hum-org"] },
  { id: "macro1", name: "Macroeconomia I", area: "Economia", semester: 3, ch: 50, prereqs: ["microeco"] },
  { id: "mat-fin1", name: "Matemática Financeira I", area: "Finanças e Contabilidade", semester: 3, ch: 75, prereqs: ["mat-adm"] },
  { id: "mod-decisao", name: "Modelos para a Tomada de Decisão", area: "Estratégia", semester: 3, ch: 50, prereqs: ["intro-adm"] },
  { id: "emp-startups", name: "Empreendedorismo e Criação de Startups & Spin-offs", area: "Empreendedorismo", semester: 3, ch: 50, prereqs: ["cult-comp-emp"] },
  { id: "plano-neg1", name: "Plano de Negócios I", area: "Empreendedorismo", semester: 3, ch: 75, prereqs: ["cult-comp-emp", "intro-adm"] },
  { id: "ext-proj2", name: "Atividades de Extensão / Projeto Integrador II", area: "Integração", semester: 3, ch: 70, prereqs: ["ext-proj1"] },
  { id: "adm-rec-pat2", name: "Adm. de Rec. Materiais e Patrimoniais II", area: "Operações", semester: 4, ch: 50, prereqs: ["adm-rec-pat1"] },
  { id: "cont2", name: "Contabilidade II", area: "Finanças e Contabilidade", semester: 4, ch: 75, prereqs: ["cont1"] },
  { id: "estat2", name: "Estatística II", area: "Finanças e Contabilidade", semester: 4, ch: 50, prereqs: ["estat1"] },
  { id: "leg-soc-trib", name: "Legislação Social e Tributária", area: "Direito e Legislação", semester: 4, ch: 50, prereqs: ["dir-emp-soc"] },
  { id: "din-rel-inter", name: "Dinâmica das Relações Interpessoais", area: "Gestão de Pessoas", semester: 4, ch: 75, prereqs: ["form-lid"] },
  { id: "macro2", name: "Macroeconomia II", area: "Economia", semester: 4, ch: 50, prereqs: ["macro1"] },
  { id: "mat-fin2", name: "Matemática Financeira II", area: "Finanças e Contabilidade", semester: 4, ch: 75, prereqs: ["mat-fin1"] },
  { id: "plano-neg2", name: "Plano de Negócios II", area: "Empreendedorismo", semester: 4, ch: 75, prereqs: ["plano-neg1"] },
  { id: "gest-inov-emp", name: "Gestão da Inovação em Empresas Físicas e Virtuais", area: "Tecnologia e Inovação", semester: 4, ch: 50, prereqs: ["novos-modelos"] },
  { id: "ext-proj3", name: "Atividades de Extensão / Projeto Integrador III", area: "Integração", semester: 4, ch: 80, prereqs: ["ext-proj2"] },
  { id: "adm-prod", name: "Administração da Produção", area: "Operações", semester: 5, ch: 50, prereqs: ["adm-rec-pat2"] },
  { id: "adm-si", name: "Administração de Sistemas de Informação", area: "Tecnologia e Inovação", semester: 5, ch: 50, prereqs: ["informatica"] },
  { id: "adm-fin1", name: "Administração Financeira I", area: "Finanças e Contabilidade", semester: 5, ch: 50, prereqs: ["mat-fin2", "cont2"] },
  { id: "gest-mkt", name: "Gestão de Marketing", area: "Marketing", semester: 5, ch: 50, prereqs: ["fund-mkt"] },
  { id: "controladoria", name: "Controladoria", area: "Finanças e Contabilidade", semester: 5, ch: 50, prereqs: ["cont2"] },
  { id: "metod-pesq", name: "Metodologia de Pesquisa Científica", area: "Integração", semester: 5, ch: 50, prereqs: [] },
  { id: "eco-intl", name: "Economia Internacional", area: "Economia", semester: 5, ch: 50, prereqs: ["macro2"] },
  { id: "teoria-org1", name: "Teoria das Organizações I", area: "Estratégia", semester: 5, ch: 50, prereqs: ["intro-adm"] },
  { id: "neg-disr", name: "Negócios Disruptivos e Gestão Empresarial", area: "Tecnologia e Inovação", semester: 5, ch: 50, prereqs: ["gest-inov-emp"] },
  { id: "ext-proj4", name: "Atividades de Extensão / Projeto Integrador IV", area: "Integração", semester: 5, ch: 90, prereqs: ["ext-proj3"] },
  { id: "ferramentas-ind4", name: "Ferramentas Gerenciais na Indústria 4.0", area: "Tecnologia e Inovação", semester: 6, ch: 50, prereqs: ["adm-si"] },
  { id: "algoritmos", name: "Algoritmos Aplicados à Administração", area: "Tecnologia e Inovação", semester: 6, ch: 50, prereqs: ["informatica"] },
  { id: "adm-fin2", name: "Administração Financeira II", area: "Finanças e Contabilidade", semester: 6, ch: 50, prereqs: ["adm-fin1"] },
  { id: "dec-prod-preco", name: "Decisões de Produto, Preço e Promoção", area: "Marketing", semester: 6, ch: 50, prereqs: ["gest-mkt"] },
  { id: "anal-eco-fin", name: "Análise Econômico-financeira de Balanços", area: "Finanças e Contabilidade", semester: 6, ch: 50, prereqs: ["adm-fin1", "cont2"] },
  { id: "eco-bras", name: "Economia Brasileira: O Ecossistema de Negócios", area: "Economia", semester: 6, ch: 50, prereqs: ["macro2"] },
  { id: "papel-adm-4rev", name: "O Papel do Administrador na 4ª Revolução Industrial", area: "Estratégia", semester: 6, ch: 50, prereqs: ["teoria-org1"] },
  { id: "teoria-cambial", name: "Teoria e Prática Cambial", area: "Finanças e Contabilidade", semester: 6, ch: 50, prereqs: ["eco-intl"] },
  { id: "teoria-org2", name: "Teoria das Organizações II", area: "Estratégia", semester: 6, ch: 50, prereqs: ["teoria-org1"] },
  { id: "ext-proj5", name: "Atividades de Extensão / Projeto Integrador V", area: "Integração", semester: 6, ch: 85, prereqs: ["ext-proj4"] },
  { id: "gest-pessoas1", name: "Gestão de Pessoas I", area: "Gestão de Pessoas", semester: 7, ch: 50, prereqs: ["din-rel-inter"] },
  { id: "fin-orc1", name: "Finanças e Orçamento I", area: "Finanças e Contabilidade", semester: 7, ch: 50, prereqs: ["adm-fin2"] },
  { id: "tend-mkt1", name: "Tendências de Marketing I", area: "Marketing", semester: 7, ch: 50, prereqs: ["dec-prod-preco"] },
  { id: "cont-custos1", name: "Contabilidade de Custos I", area: "Finanças e Contabilidade", semester: 7, ch: 50, prereqs: ["controladoria"] },
  { id: "elab-proj1", name: "Elaboração e Avaliação de Projetos I", area: "Estratégia", semester: 7, ch: 75, prereqs: ["plano-neg2", "metod-pesq"] },
  { id: "gest-qualidade", name: "Gestão da Qualidade", area: "Operações", semester: 7, ch: 50, prereqs: ["adm-prod"] },
  { id: "logist1", name: "Logística Empresarial I", area: "Operações", semester: 7, ch: 50, prereqs: ["adm-prod"] },
  { id: "pesq-oper1", name: "Pesquisa Operacional I", area: "Estratégia", semester: 7, ch: 50, prereqs: ["estat2"] },
  { id: "plan-estrat", name: "Planejamento Estratégico", area: "Estratégia", semester: 7, ch: 50, prereqs: ["teoria-org2", "mod-decisao"] },
  { id: "topicos-adm1", name: "Tópicos Avançados em Administração I", area: "Formação Básica", semester: 7, ch: 50, prereqs: ["intro-adm"] },
  { id: "ext-proj6", name: "Atividades de Extensão / Projeto Integrador VI", area: "Integração", semester: 7, ch: 85, prereqs: ["ext-proj5"] },
  { id: "gest-pessoas2", name: "Gestão de Pessoas II", area: "Gestão de Pessoas", semester: 8, ch: 50, prereqs: ["gest-pessoas1"] },
  { id: "fin-orc2", name: "Finanças e Orçamento II", area: "Finanças e Contabilidade", semester: 8, ch: 50, prereqs: ["fin-orc1"] },
  { id: "tend-mkt2", name: "Tendências de Marketing II", area: "Marketing", semester: 8, ch: 50, prereqs: ["tend-mkt1"] },
  { id: "cont-custos2", name: "Contabilidade de Custos II", area: "Finanças e Contabilidade", semester: 8, ch: 50, prereqs: ["cont-custos1"] },
  { id: "elab-proj2", name: "Elaboração e Avaliação de Projetos II", area: "Estratégia", semester: 8, ch: 75, prereqs: ["elab-proj1"] },
  { id: "logist2", name: "Logística Empresarial II", area: "Operações", semester: 8, ch: 50, prereqs: ["logist1"] },
  { id: "pesq-oper2", name: "Pesquisa Operacional II", area: "Estratégia", semester: 8, ch: 50, prereqs: ["pesq-oper1"] },
  { id: "topicos-adm2", name: "Tópicos Avançados em Administração II", area: "Formação Básica", semester: 8, ch: 50, prereqs: ["topicos-adm1"] },
  { id: "resolucao-prob", name: "Resolução Efetiva de Problemas", area: "Estratégia", semester: 8, ch: 50, prereqs: ["plan-estrat"] },
  { id: "tcc", name: "TCC", area: "Integração", semester: 8, ch: 0, prereqs: ["elab-proj2", "metod-pesq"] },
  { id: "estagio", name: "Estágio", area: "Integração", semester: 8, ch: 0, prereqs: [] },
  { id: "ativ-comp", name: "Atividades Complementares", area: "Integração", semester: 8, ch: 0, prereqs: [] },
];

const careers = [
  {
    id: "financeiro", name: "Gestor Financeiro", icon: "📈", color: "#1d4ed8",
    description: "Responsável pela saúde financeira da empresa: fluxo de caixa, investimentos, análise de balanços e planejamento orçamentário.",
    disciplines: ["mat-adm", "mat-fin1", "mat-fin2", "cont1", "cont2", "adm-fin1", "adm-fin2", "anal-eco-fin", "fin-orc1", "fin-orc2", "cont-custos1", "cont-custos2", "controladoria", "gestao-cont"],
    competencies: ["Análise Financeira", "Contabilidade", "Matemática Financeira", "Planej. Orçamentário", "Controladoria"],
    compWeights: [5, 4, 4, 3, 3],
    marketDemand: "Alta", avgSalary: "R$ 6.000 – R$ 12.000",
    topSkills: ["Excel Avançado", "Power BI", "SAP/ERP", "Valuation", "IFRS"],
  },
  {
    id: "marketing", name: "Analista de Marketing", icon: "🎯", color: "#7c3aed",
    description: "Desenvolve estratégias de marca, comunicação e crescimento. Atua com dados, comportamento do consumidor e marketing digital.",
    disciplines: ["fund-mkt", "gest-mkt", "dec-prod-preco", "tend-mkt1", "tend-mkt2", "comp-hum-org", "estat1", "estat2"],
    competencies: ["Marketing Digital", "Comportamento do Cons.", "Análise de Dados", "Branding", "Gestão de Produtos"],
    compWeights: [5, 4, 4, 3, 3],
    marketDemand: "Muito Alta", avgSalary: "R$ 4.500 – R$ 9.000",
    topSkills: ["Google Analytics", "Meta Ads", "CRM", "SEO/SEM", "Copywriting"],
  },
  {
    id: "rh", name: "Especialista em RH", icon: "👥", color: "#047857",
    description: "Cuida do capital humano: recrutamento, desenvolvimento, cultura organizacional e gestão de performance.",
    disciplines: ["psi-adm", "comp-hum-org", "form-lid", "din-rel-inter", "gest-pessoas1", "gest-pessoas2", "etica-crit"],
    competencies: ["Gestão de Talentos", "Liderança & Cultura", "Psicologia Org.", "Legislação Trab.", "T&D"],
    compWeights: [5, 4, 4, 3, 3],
    marketDemand: "Média", avgSalary: "R$ 4.000 – R$ 8.000",
    topSkills: ["People Analytics", "HRIS/HCM", "Entrevista por Comp.", "OKRs", "D&I"],
  },
  {
    id: "empreendedor", name: "Empreendedor", icon: "🚀", color: "#b45309",
    description: "Cria e escala negócios, seja como fundador de startup ou intraempreendedor dentro de grandes organizações.",
    disciplines: ["cult-comp-emp", "emp-startups", "plano-neg1", "plano-neg2", "novos-modelos", "gest-inov-emp", "neg-disr", "dir-empre-inov", "adm-fin1"],
    competencies: ["Modelagem de Negócios", "Inovação & Produto", "Finanças Básicas", "Liderança", "Vendas & Growth"],
    compWeights: [5, 5, 3, 3, 4],
    marketDemand: "Alta", avgSalary: "Variável",
    topSkills: ["Lean Startup", "Design Thinking", "Pitch", "Growth Hacking", "Product Mgmt"],
  },
  {
    id: "operacoes", name: "Gestor de Operações", icon: "⚙️", color: "#dc2626",
    description: "Otimiza processos produtivos e cadeia de suprimentos para garantir eficiência, qualidade e redução de custos.",
    disciplines: ["adm-rec-pat1", "adm-rec-pat2", "adm-prod", "gest-qualidade", "logist1", "logist2", "pesq-oper1", "pesq-oper2"],
    competencies: ["Supply Chain", "Gestão da Qualidade", "Pesquisa Operacional", "Lean / Six Sigma", "KPIs Operacionais"],
    compWeights: [5, 4, 4, 4, 3],
    marketDemand: "Alta", avgSalary: "R$ 5.500 – R$ 11.000",
    topSkills: ["Lean Manufacturing", "Six Sigma", "ERP/SAP", "Gestão de Projetos", "Power BI"],
  },
  {
    id: "estrategia", name: "Consultor Estratégico", icon: "🔍", color: "#0891b2",
    description: "Analisa cenários e propõe soluções para desafios complexos de negócio, atuando em consultorias ou áreas de estratégia corporativa.",
    disciplines: ["mod-decisao", "teoria-org1", "teoria-org2", "plan-estrat", "elab-proj1", "elab-proj2", "papel-adm-4rev", "pesq-oper1"],
    competencies: ["Análise Estratégica", "Gestão de Projetos", "Raciocínio Analítico", "Comunicação Exec.", "Modelagem de Cenários"],
    compWeights: [5, 4, 5, 4, 3],
    marketDemand: "Muito Alta", avgSalary: "R$ 8.000 – R$ 18.000",
    topSkills: ["Frameworks Estratégicos", "Excel/PPT Avançado", "Python/SQL básico", "Storytelling", "Stakeholders"],
  },
];

const areaColors = {
  "Formação Básica": "#64748b", "Finanças e Contabilidade": "#1d4ed8", "Marketing": "#7c3aed",
  "Gestão de Pessoas": "#047857", "Estratégia": "#b45309", "Operações": "#dc2626",
  "Economia": "#0891b2", "Empreendedorismo": "#d97706", "Tecnologia e Inovação": "#6d28d9",
  "Direito e Legislação": "#374151", "Integração": "#9333ea",
};

// ── Radar Chart ──────────────────────────────────────────────────────────────
function RadarChart({ data, color, size = 180 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  const n = data.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, radius) => [cx + radius * Math.cos(angle(i)), cy + radius * Math.sin(angle(i))];

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map(g => (
        <polygon key={g} points={data.map((_, i) => pt(i, r * g).join(",")).join(" ")} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {data.map((_, i) => <line key={i} x1={cx} y1={cy} x2={pt(i, r)[0]} y2={pt(i, r)[1]} stroke="#e5e7eb" strokeWidth="1" />)}
      <polygon
        points={data.map((d, i) => pt(i, r * (d.value / 5)).join(",")).join(" ")}
        fill={color + "28"} stroke={color} strokeWidth="2" />
      {data.map((d, i) => {
        const [lx, ly] = pt(i, r * 1.32);
        const [dx, dy] = pt(i, r * (d.value / 5));
        return (
          <g key={i}>
            <circle cx={dx} cy={dy} r="3.5" fill={color} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 9, fill: "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
              {d.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Disc Card ────────────────────────────────────────────────────────────────
function DiscCard({ disc, completed, isUnlocked, toggleCompleted, setSelectedDisc, selectedDisc }) {
  const done = completed.has(disc.id);
  const unlocked = isUnlocked(disc);
  const color = areaColors[disc.area];
  const isSelected = selectedDisc === disc.id;
  return (
    <div className="disc-card" onClick={() => setSelectedDisc(disc.id)}
      style={{ background: done ? "#1d4ed8" : "#fff", border: `1.5px solid ${isSelected ? (done ? "rgba(255,255,255,0.4)" : color) : done ? "#1d4ed8" : unlocked ? "#e5e7eb" : "#f0f0f0"}`, borderRadius: 9, padding: "11px 11px 9px", opacity: !unlocked && !done ? 0.52 : 1, boxShadow: done ? "0 2px 10px rgba(29,78,216,0.18)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 7 }}>
        <div style={{ padding: "1px 6px", background: done ? "rgba(255,255,255,0.15)" : `${color}12`, borderRadius: 3, fontSize: 9, fontWeight: 600, color: done ? "rgba(255,255,255,0.7)" : color, letterSpacing: "0.3px", maxWidth: "82%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {disc.area.toUpperCase()}
        </div>
        <div className="check-anim" onClick={e => { e.stopPropagation(); if (unlocked || done) toggleCompleted(disc.id); }}
          style={{ width: 18, height: 18, borderRadius: 4, border: done ? "none" : `1.5px solid ${unlocked ? "#d1d5db" : "#e5e7eb"}`, background: done ? "rgba(255,255,255,0.2)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: unlocked || done ? "pointer" : "default", flexShrink: 0 }}>
          {done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: done ? "#fff" : unlocked ? "#1a1a2e" : "#9ca3af", lineHeight: 1.4, marginBottom: 8, minHeight: 32 }}>{disc.name}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: done ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>{disc.ch > 0 ? `${disc.ch}h` : "—"} · {disc.semester}º sem.</span>
        {!unlocked && !done && <span style={{ fontSize: 9, color: "#d1d5db" }}>🔒</span>}
        {unlocked && !done && <span style={{ fontSize: 9, fontWeight: 700, color, background: `${color}10`, padding: "1px 5px", borderRadius: 3 }}>LIVRE</span>}
      </div>
    </div>
  );
}

// ── Gap Analysis ─────────────────────────────────────────────────────────────
function GapAnalysis({ completed, isUnlocked, toggleCompleted, setSelectedDisc }) {
  const [selected, setSelected] = useState(careers[0].id);
  const career = careers.find(c => c.id === selected);

  const careerDiscs = disciplines.filter(d => career.disciplines.includes(d.id));
  const doneDiscs = careerDiscs.filter(d => completed.has(d.id));
  const missingDiscs = careerDiscs.filter(d => !completed.has(d.id));
  const nextUnlocked = missingDiscs.filter(d => isUnlocked(d));
  const stillBlocked = missingDiscs.filter(d => !isUnlocked(d));
  const pct = Math.round((doneDiscs.length / Math.max(careerDiscs.length, 1)) * 100);

  const doneFrac = doneDiscs.length / Math.max(careerDiscs.length, 1);
  const radarData = career.competencies.map((name, i) => ({
    name,
    value: Math.min(5, Math.max(1, Math.round(career.compWeights[i] * doneFrac + 0.5))),
  }));

  const demandColor = { "Muito Alta": "#047857", "Alta": "#1d4ed8", "Média": "#b45309" };

  return (
    <div className="fade-in" style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 400, color: "#1a1a2e", letterSpacing: "-0.3px" }}>Gap Analysis de Carreira</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Compare seu progresso atual com as exigências de cada trilha profissional</p>
      </div>

      {/* Career selector */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22 }}>
        {careers.map(c => {
          const p = Math.round((disciplines.filter(d => c.disciplines.includes(d.id) && completed.has(d.id)).length / c.disciplines.length) * 100);
          return (
            <button key={c.id} onClick={() => setSelected(c.id)} className="nav-btn"
              style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1.5px solid ${selected === c.id ? c.color : "#e5e7eb"}`, background: selected === c.id ? `${c.color}10` : "#fff", color: selected === c.id ? c.color : "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{c.icon}</span><span>{c.name}</span>
              <span style={{ background: selected === c.id ? c.color : "#e5e7eb", color: selected === c.id ? "#fff" : "#9ca3af", borderRadius: 10, padding: "0 6px", fontSize: 10 }}>{p}%</span>
            </button>
          );
        })}
      </div>

      {/* Top 3 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>

        {/* Card 1 – Career info */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${career.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{career.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{career.name}</div>
              <div style={{ fontSize: 10, color: career.color, fontWeight: 600, letterSpacing: "0.3px" }}>TRILHA DE CARREIRA</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 14 }}>{career.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
            {[["DEMANDA", career.marketDemand, demandColor[career.marketDemand]], ["SALÁRIO MÉDIO", career.avgSalary, "#1a1a2e"]].map(([l, v, clr]) => (
              <div key={l} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: clr }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.4px", marginBottom: 7 }}>SKILLS DO MERCADO</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {career.topSkills.map(s => <span key={s} style={{ fontSize: 10, padding: "3px 8px", background: `${career.color}10`, color: career.color, borderRadius: 4, fontWeight: 500 }}>{s}</span>)}
          </div>
        </div>

        {/* Card 2 – Radar */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.5px", marginBottom: 12, alignSelf: "flex-start" }}>SEU PERFIL DE COMPETÊNCIAS</div>
          <RadarChart data={radarData} color={career.color} size={185} />
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: career.color }}>{pct}%</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>cobertura da trilha</div>
          </div>
        </div>

        {/* Card 3 – Progress detail */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.5px", marginBottom: 14 }}>PROGRESSO DETALHADO</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}>Disciplinas concluídas</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: career.color }}>{doneDiscs.length}/{careerDiscs.length}</span>
            </div>
            <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: career.color, borderRadius: 4, transition: "width 0.6s ease" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
            {[["Concluídas", doneDiscs.length, "#047857", "#f0fdf4"], ["Disponíveis", nextUnlocked.length, career.color, `${career.color}10`], ["Bloqueadas", stillBlocked.length, "#9ca3af", "#f9fafb"]].map(([l, v, c, bg]) => (
              <div key={l} style={{ background: bg, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 9, color: c, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 8, background: pct >= 80 ? "#f0fdf4" : pct >= 40 ? "#eff6ff" : "#fefce8", border: `1px solid ${pct >= 80 ? "#bbf7d0" : pct >= 40 ? "#bfdbfe" : "#fde68a"}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: pct >= 80 ? "#047857" : pct >= 40 ? "#1d4ed8" : "#b45309", marginBottom: 2 }}>
              {pct >= 80 ? "✅ Pronto para o mercado!" : pct >= 40 ? "📚 Em bom progresso" : "🌱 Início da jornada"}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>
              {pct >= 80 ? "Você cobriu a maior parte das disciplinas desta trilha." : pct >= 40 ? `Faltam ${missingDiscs.length} disciplinas para completar a trilha.` : "Complete as disciplinas disponíveis para avançar nesta trilha."}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Available now */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.5px" }}>DISPONÍVEIS AGORA</div>
            <span style={{ fontSize: 10, background: `${career.color}12`, color: career.color, padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>{nextUnlocked.length} disciplinas</span>
          </div>
          {nextUnlocked.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
              {missingDiscs.length === 0 ? "🎉 Trilha completa!" : "Complete os pré-requisitos para desbloquear as próximas."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {nextUnlocked.map(disc => (
                <div key={disc.id} onClick={() => setSelectedDisc(disc.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", borderRadius: 7, background: "#f9fafb", cursor: "pointer", border: "1px solid transparent", transition: "border 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.border = `1px solid ${career.color}44`}
                  onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: career.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{disc.name}</span>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{disc.semester}º sem.</span>
                  <div className="check-anim" onClick={e => { e.stopPropagation(); toggleCompleted(disc.id); }}
                    style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${career.color}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: career.color, fontSize: 12, fontWeight: 700 }}>+</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.5px" }}>JÁ CONCLUÍDAS NESTA TRILHA</div>
            <span style={{ fontSize: 10, background: "#f0fdf4", color: "#047857", padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>{doneDiscs.length} disciplinas</span>
          </div>
          {doneDiscs.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Nenhuma disciplina concluída nesta trilha ainda.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {doneDiscs.map(disc => (
                <div key={disc.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 7 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  </div>
                  <span style={{ fontSize: 12, color: "#374151" }}>{disc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [completed, setCompleted] = useState(new Set());
  const [mainView, setMainView] = useState("mapa");
  const [activeView, setActiveView] = useState("semestres");
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedDisc, setSelectedDisc] = useState(null);

  const areas = [...new Set(disciplines.map(d => d.area))];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggleCompleted = (id) => setCompleted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const isUnlocked = (disc) => disc.prereqs.every(p => completed.has(p));

  const totalCH = disciplines.reduce((a, d) => a + d.ch, 0);
  const completedCH = disciplines.filter(d => completed.has(d.id)).reduce((a, d) => a + d.ch, 0);
  const totalProgress = Math.round((completed.size / disciplines.length) * 100);

  const getAreaProgress = (area) => { const d = disciplines.filter(x => x.area === area); return { done: d.filter(x => completed.has(x.id)).length, total: d.length }; };
  const getCareerProgress = (career) => { const done = career.disciplines.filter(id => completed.has(id)).length; return Math.round((done / career.disciplines.length) * 100); };
  const getSemesterProgress = (sem) => { const d = disciplines.filter(x => x.semester === sem); return { done: d.filter(x => completed.has(x.id)).length, total: d.length }; };

  const recommendations = useMemo(() => disciplines.filter(d => !completed.has(d.id) && isUnlocked(d)).slice(0, 5), [completed]);
  const filteredDiscs = useMemo(() => {
    if (activeView === "trilhas" && selectedCareer) { const c = careers.find(x => x.id === selectedCareer); return disciplines.filter(d => c.disciplines.includes(d.id)); }
    if (activeView === "areas" && selectedArea) return disciplines.filter(d => d.area === selectedArea);
    return disciplines;
  }, [activeView, selectedArea, selectedCareer]);

  const selectedDiscInfo = selectedDisc ? disciplines.find(d => d.id === selectedDisc) : null;

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: "#f8f9fb", minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:2px}
        .disc-card{transition:transform 0.15s ease,box-shadow 0.15s ease;cursor:pointer}
        .disc-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.09)!important}
        .nav-btn{transition:all 0.15s ease;cursor:pointer;border:none}
        .sidebar-btn{transition:background 0.12s ease;cursor:pointer;border:none;background:none;width:100%;text-align:left}
        .fade-in{animation:fadeIn 0.25s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .check-anim{transition:transform 0.15s ease} .check-anim:hover{transform:scale(1.15)}
        .prog-bar{transition:width 0.5s ease}
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="data:image/gif;base64,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" alt="UNIARA" style={{ height: 40, objectFit: "contain" }} />
          <div style={{ width: 1, height: 30, background: "#e5e7eb" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px" }}>Mapa de Aprendizagem</div>
            <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.5px", fontWeight: 500 }}>ADMINISTRAÇÃO · UNIARA · ARARAQUARA</div>
          </div>
        </div>

        {/* Main nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f3f4f6", borderRadius: 9, padding: 3 }}>
          {[["mapa", "🗺️ Mapa"], ["gap", "📊 Gap Analysis"]].map(([v, l]) => (
            <button key={v} className="nav-btn" onClick={() => setMainView(v)}
              style={{ padding: "6px 16px", borderRadius: 7, background: mainView === v ? "#fff" : "transparent", boxShadow: mainView === v ? "0 1px 4px rgba(0,0,0,0.10)" : "none", fontSize: 12, fontWeight: mainView === v ? 600 : 400, color: mainView === v ? "#1a1a2e" : "#6b7280" }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 3 }}>Progresso Geral</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 90, height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div className="prog-bar" style={{ width: `${totalProgress}%`, height: "100%", background: "#1d4ed8", borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{totalProgress}%</span>
            </div>
          </div>
          <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "5px 11px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{completed.size}<span style={{ fontSize: 10, fontWeight: 400, color: "#6b7280" }}>/{disciplines.length}</span></div>
            <div style={{ fontSize: 9, color: "#9ca3af" }}>disciplinas</div>
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 8, padding: "5px 11px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1d4ed8" }}>{completedCH}<span style={{ fontSize: 10, fontWeight: 400, color: "#93c5fd" }}>/{totalCH}h</span></div>
            <div style={{ fontSize: 9, color: "#93c5fd" }}>horas/aula</div>
          </div>
        </div>
      </div>

      {/* GAP ANALYSIS */}
      {mainView === "gap" ? (
        <div style={{ height: "calc(100vh - 62px)", overflowY: "auto" }}>
          <GapAnalysis completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={(id) => { setSelectedDisc(id); setMainView("mapa"); }} />
        </div>
      ) : (
        <div style={{ display: "flex", height: "calc(100vh - 62px)" }}>

          {/* SIDEBAR */}
          <div style={{ width: 248, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ padding: "12px 10px 0" }}>
              <div style={{ background: "#f3f4f6", borderRadius: 8, padding: 3, display: "flex", gap: 2 }}>
                {[["semestres", "Semestres"], ["areas", "Áreas"], ["trilhas", "Trilhas"]].map(([v, l]) => (
                  <button key={v} className="nav-btn" onClick={() => { setActiveView(v); setSelectedArea(null); setSelectedCareer(null); }}
                    style={{ flex: 1, padding: "5px 0", borderRadius: 6, background: activeView === v ? "#fff" : "transparent", boxShadow: activeView === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: 11, fontWeight: activeView === v ? 600 : 400, color: activeView === v ? "#1a1a2e" : "#6b7280" }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
              {activeView === "semestres" && semesters.map(s => {
                const { done, total } = getSemesterProgress(s);
                const pct = Math.round((done / total) * 100);
                return (
                  <div key={s} style={{ padding: "7px 10px", borderRadius: 7, marginBottom: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{s}º Semestre</span>
                      <span style={{ fontSize: 10, color: pct === 100 ? "#047857" : "#6b7280", fontWeight: pct === 100 ? 600 : 400 }}>{pct === 100 ? "✓ ok" : `${done}/${total}`}</span>
                    </div>
                    <div style={{ width: "100%", height: 3, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#047857" : "#1d4ed8", borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}

              {activeView === "areas" && areas.map(area => {
                const { done, total } = getAreaProgress(area);
                const pct = Math.round((done / total) * 100);
                const color = areaColors[area];
                return (
                  <button key={area} className="sidebar-btn" onClick={() => setSelectedArea(selectedArea === area ? null : area)}
                    style={{ padding: "8px 10px", borderRadius: 7, background: selectedArea === area ? `${color}10` : "transparent", marginBottom: 2, border: selectedArea === area ? `1px solid ${color}22` : "1px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: selectedArea === area ? 600 : 400, color: selectedArea === area ? color : "#374151" }}>{area}</span>
                      </div>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{pct}%</span>
                    </div>
                    <div style={{ width: "100%", height: 2, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color }} />
                    </div>
                  </button>
                );
              })}

              {activeView === "trilhas" && careers.map(career => {
                const pct = getCareerProgress(career);
                return (
                  <button key={career.id} className="sidebar-btn" onClick={() => setSelectedCareer(selectedCareer === career.id ? null : career.id)}
                    style={{ padding: "10px 10px", borderRadius: 7, background: selectedCareer === career.id ? `${career.color}10` : "transparent", marginBottom: 3, border: selectedCareer === career.id ? `1px solid ${career.color}22` : "1px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13 }}>{career.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: selectedCareer === career.id ? 600 : 400, color: selectedCareer === career.id ? career.color : "#374151" }}>{career.name}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: career.color }}>{pct}%</span>
                    </div>
                    <div style={{ width: "100%", height: 3, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: career.color }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", padding: "10px 12px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.5px", marginBottom: 8 }}>PRÓXIMOS PASSOS</div>
              {recommendations.length === 0
                ? <div style={{ fontSize: 12, color: "#047857", fontWeight: 500 }}>Parabéns! Tudo concluído 🎉</div>
                : recommendations.map(d => (
                  <div key={d.id} onClick={() => setSelectedDisc(d.id)} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6, cursor: "pointer" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: areaColors[d.area], flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.4 }}>{d.name}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
            {activeView === "semestres" ? (
              semesters.map(sem => {
                const semDiscs = disciplines.filter(d => d.semester === sem);
                const { done, total } = getSemesterProgress(sem);
                return (
                  <div key={sem} className="fade-in" style={{ marginBottom: 26 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ background: done === total ? "#dcfce7" : "#eff6ff", borderRadius: 6, padding: "2px 10px" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: done === total ? "#047857" : "#1d4ed8" }}>{sem}º Semestre</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{done}/{total} disciplinas · {semDiscs.reduce((a, d) => a + d.ch, 0)}h</span>
                      {done === total && <span style={{ fontSize: 11, color: "#047857", fontWeight: 600 }}>✓ Concluído</span>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 8 }}>
                      {semDiscs.map(disc => <DiscCard key={disc.id} disc={disc} completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={setSelectedDisc} selectedDisc={selectedDisc} />)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, fontWeight: 400, color: "#1a1a2e" }}>
                    {activeView === "trilhas" && selectedCareer ? careers.find(c => c.id === selectedCareer)?.name : activeView === "areas" && selectedArea ? selectedArea : "← Selecione no painel lateral"}
                  </h2>
                  {(selectedArea || selectedCareer) && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{filteredDiscs.length} disciplinas · {filteredDiscs.filter(d => completed.has(d.id)).length} concluídas</p>}
                </div>
                {(selectedArea || selectedCareer) && (
                  <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 8 }}>
                    {filteredDiscs.sort((a, b) => a.semester - b.semester).map(disc => <DiscCard key={disc.id} disc={disc} completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={setSelectedDisc} selectedDisc={selectedDisc} />)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DETAIL PANEL */}
          {selectedDiscInfo && (
            <div style={{ width: 268, background: "#fff", borderLeft: "1px solid #e5e7eb", padding: 18, overflowY: "auto", flexShrink: 0 }} className="fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${areaColors[selectedDiscInfo.area]}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📘</div>
                <button onClick={() => setSelectedDisc(null)} className="nav-btn" style={{ width: 26, height: 26, borderRadius: 6, background: "#f3f4f6", color: "#6b7280", fontSize: 15 }}>×</button>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: areaColors[selectedDiscInfo.area], letterSpacing: "0.5px", marginBottom: 4 }}>{selectedDiscInfo.area.toUpperCase()}</div>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, fontWeight: 400, color: "#1a1a2e", lineHeight: 1.4, marginBottom: 14 }}>{selectedDiscInfo.name}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                {[["Semestre", `${selectedDiscInfo.semester}º`], ["C.H.", selectedDiscInfo.ch > 0 ? `${selectedDiscInfo.ch}h` : "—"], ["Status", completed.has(selectedDiscInfo.id) ? "✓ Concluída" : isUnlocked(selectedDiscInfo) ? "Disponível" : "Bloqueada"], ["Pré-reqs", selectedDiscInfo.prereqs.length || "Nenhum"]].map(([l, v]) => (
                  <div key={l} style={{ background: "#f9fafb", borderRadius: 7, padding: "7px 9px" }}>
                    <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}>{v}</div>
                  </div>
                ))}
              </div>
              {selectedDiscInfo.prereqs.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.4px", marginBottom: 7 }}>PRÉ-REQUISITOS</div>
                  {selectedDiscInfo.prereqs.map(rId => {
                    const r = disciplines.find(d => d.id === rId);
                    const done = completed.has(rId);
                    return (
                      <div key={rId} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, cursor: "pointer" }} onClick={() => setSelectedDisc(rId)}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: done ? "#1d4ed8" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {done && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>}
                        </div>
                        <span style={{ fontSize: 11, color: done ? "#374151" : "#9ca3af" }}>{r?.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.4px", marginBottom: 7 }}>RELEVANTE PARA</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {careers.filter(c => c.disciplines.includes(selectedDiscInfo.id)).map(c => (
                    <span key={c.id} style={{ fontSize: 10, padding: "2px 8px", background: `${c.color}12`, color: c.color, borderRadius: 4, fontWeight: 600, cursor: "pointer" }}
                      onClick={() => { setMainView("gap"); }}>
                      {c.icon} {c.name}
                    </span>
                  ))}
                  {careers.filter(c => c.disciplines.includes(selectedDiscInfo.id)).length === 0 && (
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>Disciplina de base geral</span>
                  )}
                </div>
              </div>
              <button onClick={() => { if (isUnlocked(selectedDiscInfo) || completed.has(selectedDiscInfo.id)) toggleCompleted(selectedDiscInfo.id); }}
                disabled={!isUnlocked(selectedDiscInfo) && !completed.has(selectedDiscInfo.id)}
                style={{ width: "100%", padding: "8px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 600, cursor: isUnlocked(selectedDiscInfo) || completed.has(selectedDiscInfo.id) ? "pointer" : "not-allowed", background: completed.has(selectedDiscInfo.id) ? "#f3f4f6" : isUnlocked(selectedDiscInfo) ? "#1d4ed8" : "#f3f4f6", color: completed.has(selectedDiscInfo.id) ? "#6b7280" : isUnlocked(selectedDiscInfo) ? "#fff" : "#9ca3af" }}>
                {completed.has(selectedDiscInfo.id) ? "Marcar como não concluída" : isUnlocked(selectedDiscInfo) ? "Marcar como concluída ✓" : "🔒 Bloqueada"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}