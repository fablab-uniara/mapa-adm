import { useState, useMemo, useEffect, useRef } from "react";
import { auth, db, googleProvider } from "./config/firebase";
import { doc, setDoc, getDoc, collection, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { signOut, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import Icon from "./components/Icons";
import { getAutoCompetencies } from "./utils/helpers";
import { UNIARA_LOGO_B64 } from "./constants/logo";
import { EXP_TYPES } from "./constants/expTypes";
const COORDINATOR_EMAIL = "gbraz@uniara.edu.br";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   "#6366f1",
  primaryDark:"#4f46e5",
  violet:    "#8b5cf6",
  cyan:      "#06b6d4",
  green:     "#10b981",
  amber:     "#f59e0b",
  red:       "#ef4444",
  orange:    "#f97316",
  bg:        "#f1f5f9",
  surface:   "#ffffff",
  border:    "#e2e8f0",
  text:      "#0f172a",
  muted:     "#64748b",
  subtle:    "#94a3b8",
  grad1:     "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
  grad2:     "linear-gradient(135deg,#06b6d4 0%,#6366f1 100%)",
  grad3:     "linear-gradient(135deg,#10b981 0%,#06b6d4 100%)",
  shadow:    "0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)",
  shadowMd:  "0 4px 24px rgba(99,102,241,0.12)",
};

const disciplines = [
  { id:"com-exp",name:"Comunicação e Expressão",area:"Formação Básica",semester:1,ch:50,prereqs:[],competencies:["Comunicação","Redação Profissional"] },
  { id:"etica-crit",name:"Ética e Pensamento Crítico",area:"Formação Básica",semester:1,ch:50,prereqs:[],competencies:["Ética Profissional","Pensamento Crítico"] },
  { id:"informatica",name:"Informática",area:"Tecnologia e Inovação",semester:1,ch:75,prereqs:[],competencies:["Excel","Ferramentas Digitais"] },
  { id:"dir-empre-inov",name:"Direito Aplicado ao Empreendedorismo e Inovação",area:"Direito e Legislação",semester:1,ch:50,prereqs:[],competencies:["Legislação Empresarial","Propriedade Intelectual"] },
  { id:"cult-comp-emp",name:"Cultura e Comportamento Empreendedor",area:"Empreendedorismo",semester:1,ch:75,prereqs:[],competencies:["Empreendedorismo","Visão de Negócios"] },
  { id:"intro-eco",name:"Introdução à Economia",area:"Economia",semester:1,ch:50,prereqs:[],competencies:["Fundamentos Econômicos","Análise de Mercado"] },
  { id:"novos-modelos",name:"Novos Modelos de Negócios na Era Digital",area:"Tecnologia e Inovação",semester:1,ch:50,prereqs:[],competencies:["Modelos de Negócio","Transformação Digital"] },
  { id:"psi-adm",name:"Psicologia Aplicada à Administração",area:"Gestão de Pessoas",semester:1,ch:50,prereqs:[],competencies:["Psicologia Organizacional","Inteligência Emocional"] },
  { id:"ciencias-soc",name:"Ciências Sociais",area:"Formação Básica",semester:1,ch:50,prereqs:[],competencies:["Sociologia","Análise Social"] },
  { id:"comp-hum-org",name:"Comportamento Humano nas Organizações",area:"Gestão de Pessoas",semester:2,ch:50,prereqs:["psi-adm"],competencies:["Comportamento Organizacional","Dinâmica de Grupos"] },
  { id:"gestao-cont",name:"Gestão Contábil",area:"Finanças e Contabilidade",semester:2,ch:50,prereqs:[],competencies:["Contabilidade Básica","Gestão Financeira"] },
  { id:"intro-adm",name:"Introdução a Administração",area:"Formação Básica",semester:2,ch:110,prereqs:[],competencies:["Gestão Organizacional","Processos Administrativos"] },
  { id:"fund-mkt",name:"Fundamentos de Marketing",area:"Marketing",semester:2,ch:50,prereqs:[],competencies:["Marketing","Análise de Mercado"] },
  { id:"dir-emp-soc",name:"Introdução ao Direito Empresarial e Societário",area:"Direito e Legislação",semester:2,ch:50,prereqs:["dir-empre-inov"],competencies:["Direito Empresarial","Contratos"] },
  { id:"mat-adm",name:"Matemática Aplicada à Administração",area:"Finanças e Contabilidade",semester:2,ch:110,prereqs:[],competencies:["Matemática Financeira","Análise Quantitativa"] },
  { id:"microeco",name:"Microeconomia",area:"Economia",semester:2,ch:50,prereqs:["intro-eco"],competencies:["Microeconomia","Teoria dos Preços"] },
  { id:"soc-adm",name:"Sociologia Aplicada à Administração",area:"Formação Básica",semester:2,ch:50,prereqs:["ciencias-soc"],competencies:["Sociologia Organizacional","Cultura Corporativa"] },
  { id:"ext-proj1",name:"Atividades de Extensão / Projeto Integrador I",area:"Integração",semester:2,ch:90,prereqs:[],competencies:["Gestão de Projetos","Trabalho em Equipe"] },
  { id:"adm-rec-pat1",name:"Adm. de Rec. Materiais e Patrimoniais I",area:"Operações",semester:3,ch:50,prereqs:["intro-adm"],competencies:["Gestão de Estoque","Patrimônio"] },
  { id:"cont1",name:"Contabilidade I",area:"Finanças e Contabilidade",semester:3,ch:75,prereqs:["gestao-cont"],competencies:["Contabilidade","Demonstrações Financeiras"] },
  { id:"estat1",name:"Estatística I",area:"Finanças e Contabilidade",semester:3,ch:50,prereqs:["mat-adm"],competencies:["Estatística","Análise de Dados"] },
  { id:"form-lid",name:"Formação de Líderes",area:"Gestão de Pessoas",semester:3,ch:75,prereqs:["comp-hum-org"],competencies:["Liderança","Gestão de Equipes"] },
  { id:"macro1",name:"Macroeconomia I",area:"Economia",semester:3,ch:50,prereqs:["microeco"],competencies:["Macroeconomia","Política Econômica"] },
  { id:"mat-fin1",name:"Matemática Financeira I",area:"Finanças e Contabilidade",semester:3,ch:75,prereqs:["mat-adm"],competencies:["Matemática Financeira","Juros e Descontos"] },
  { id:"mod-decisao",name:"Modelos para a Tomada de Decisão",area:"Estratégia",semester:3,ch:50,prereqs:["intro-adm"],competencies:["Tomada de Decisão","Análise de Cenários"] },
  { id:"emp-startups",name:"Empreendedorismo e Criação de Startups",area:"Empreendedorismo",semester:3,ch:50,prereqs:["cult-comp-emp"],competencies:["Startups","Lean Startup"] },
  { id:"plano-neg1",name:"Plano de Negócios I",area:"Empreendedorismo",semester:3,ch:75,prereqs:["cult-comp-emp","intro-adm"],competencies:["Plano de Negócios","Canvas"] },
  { id:"ext-proj2",name:"Atividades de Extensão / Projeto Integrador II",area:"Integração",semester:3,ch:70,prereqs:["ext-proj1"],competencies:["Gestão de Projetos","Extensão Universitária"] },
  { id:"adm-rec-pat2",name:"Adm. de Rec. Materiais e Patrimoniais II",area:"Operações",semester:4,ch:50,prereqs:["adm-rec-pat1"],competencies:["Supply Chain","Logística"] },
  { id:"cont2",name:"Contabilidade II",area:"Finanças e Contabilidade",semester:4,ch:75,prereqs:["cont1"],competencies:["Contabilidade Avançada","Análise Financeira"] },
  { id:"estat2",name:"Estatística II",area:"Finanças e Contabilidade",semester:4,ch:50,prereqs:["estat1"],competencies:["Estatística Avançada","Probabilidade"] },
  { id:"leg-soc-trib",name:"Legislação Social e Tributária",area:"Direito e Legislação",semester:4,ch:50,prereqs:["dir-emp-soc"],competencies:["Direito Tributário","Legislação Trabalhista"] },
  { id:"din-rel-inter",name:"Dinâmica das Relações Interpessoais",area:"Gestão de Pessoas",semester:4,ch:75,prereqs:["form-lid"],competencies:["Relações Interpessoais","Comunicação Assertiva"] },
  { id:"macro2",name:"Macroeconomia II",area:"Economia",semester:4,ch:50,prereqs:["macro1"],competencies:["Política Fiscal","Política Monetária"] },
  { id:"mat-fin2",name:"Matemática Financeira II",area:"Finanças e Contabilidade",semester:4,ch:75,prereqs:["mat-fin1"],competencies:["Análise de Investimentos","VPL/TIR"] },
  { id:"plano-neg2",name:"Plano de Negócios II",area:"Empreendedorismo",semester:4,ch:75,prereqs:["plano-neg1"],competencies:["Valuation","Modelo Financeiro"] },
  { id:"gest-inov-emp",name:"Gestão da Inovação em Empresas",area:"Tecnologia e Inovação",semester:4,ch:50,prereqs:["novos-modelos"],competencies:["Inovação","Design Thinking"] },
  { id:"ext-proj3",name:"Atividades de Extensão / Projeto Integrador III",area:"Integração",semester:4,ch:80,prereqs:["ext-proj2"],competencies:["Gestão de Projetos","Impacto Social"] },
  { id:"adm-prod",name:"Administração da Produção",area:"Operações",semester:5,ch:50,prereqs:["adm-rec-pat2"],competencies:["Gestão da Produção","PCP"] },
  { id:"adm-si",name:"Administração de Sistemas de Informação",area:"Tecnologia e Inovação",semester:5,ch:50,prereqs:["informatica"],competencies:["Sistemas de Informação","ERP"] },
  { id:"adm-fin1",name:"Administração Financeira I",area:"Finanças e Contabilidade",semester:5,ch:50,prereqs:["mat-fin2","cont2"],competencies:["Finanças Corporativas","Fluxo de Caixa"] },
  { id:"gest-mkt",name:"Gestão de Marketing",area:"Marketing",semester:5,ch:50,prereqs:["fund-mkt"],competencies:["Marketing Estratégico","Branding"] },
  { id:"controladoria",name:"Controladoria",area:"Finanças e Contabilidade",semester:5,ch:50,prereqs:["cont2"],competencies:["Controladoria","Orçamento Empresarial"] },
  { id:"metod-pesq",name:"Metodologia de Pesquisa Científica",area:"Integração",semester:5,ch:50,prereqs:[],competencies:["Pesquisa Científica","Metodologia"] },
  { id:"eco-intl",name:"Economia Internacional",area:"Economia",semester:5,ch:50,prereqs:["macro2"],competencies:["Comércio Internacional","Câmbio"] },
  { id:"teoria-org1",name:"Teoria das Organizações I",area:"Estratégia",semester:5,ch:50,prereqs:["intro-adm"],competencies:["Teoria Organizacional","Estruturas Organizacionais"] },
  { id:"neg-disr",name:"Negócios Disruptivos e Gestão Empresarial",area:"Tecnologia e Inovação",semester:5,ch:50,prereqs:["gest-inov-emp"],competencies:["Disrupção","Novos Mercados"] },
  { id:"ext-proj4",name:"Atividades de Extensão / Projeto Integrador IV",area:"Integração",semester:5,ch:90,prereqs:["ext-proj3"],competencies:["Gestão de Projetos","Liderança"] },
  { id:"ferramentas-ind4",name:"Ferramentas Gerenciais na Indústria 4.0",area:"Tecnologia e Inovação",semester:6,ch:50,prereqs:["adm-si"],competencies:["Indústria 4.0","IoT/Automação"] },
  { id:"algoritmos",name:"Algoritmos Aplicados à Administração",area:"Tecnologia e Inovação",semester:6,ch:50,prereqs:["informatica"],competencies:["Lógica de Programação","Automação de Processos"] },
  { id:"adm-fin2",name:"Administração Financeira II",area:"Finanças e Contabilidade",semester:6,ch:50,prereqs:["adm-fin1"],competencies:["Análise de Investimentos","Risco Financeiro"] },
  { id:"dec-prod-preco",name:"Decisões de Produto, Preço e Promoção",area:"Marketing",semester:6,ch:50,prereqs:["gest-mkt"],competencies:["Mix de Marketing","Precificação"] },
  { id:"anal-eco-fin",name:"Análise Econômico-financeira de Balanços",area:"Finanças e Contabilidade",semester:6,ch:50,prereqs:["adm-fin1","cont2"],competencies:["Análise de Balanços","Indicadores Financeiros"] },
  { id:"eco-bras",name:"Economia Brasileira",area:"Economia",semester:6,ch:50,prereqs:["macro2"],competencies:["Economia Brasileira","Cenário Macroeconômico"] },
  { id:"papel-adm-4rev",name:"O Papel do Administrador na 4ª Revolução Industrial",area:"Estratégia",semester:6,ch:50,prereqs:["teoria-org1"],competencies:["Gestão da Mudança","Liderança Digital"] },
  { id:"teoria-cambial",name:"Teoria e Prática Cambial",area:"Finanças e Contabilidade",semester:6,ch:50,prereqs:["eco-intl"],competencies:["Câmbio","Finanças Internacionais"] },
  { id:"teoria-org2",name:"Teoria das Organizações II",area:"Estratégia",semester:6,ch:50,prereqs:["teoria-org1"],competencies:["Cultura Organizacional","Mudança Organizacional"] },
  { id:"ext-proj5",name:"Atividades de Extensão / Projeto Integrador V",area:"Integração",semester:6,ch:85,prereqs:["ext-proj4"],competencies:["Consultoria","Diagnóstico Empresarial"] },
  { id:"gest-pessoas1",name:"Gestão de Pessoas I",area:"Gestão de Pessoas",semester:7,ch:50,prereqs:["din-rel-inter"],competencies:["Recrutamento e Seleção","Avaliação de Desempenho"] },
  { id:"fin-orc1",name:"Finanças e Orçamento I",area:"Finanças e Contabilidade",semester:7,ch:50,prereqs:["adm-fin2"],competencies:["Orçamento Empresarial","Planejamento Financeiro"] },
  { id:"tend-mkt1",name:"Tendências de Marketing I",area:"Marketing",semester:7,ch:50,prereqs:["dec-prod-preco"],competencies:["Marketing Digital","Growth Hacking"] },
  { id:"cont-custos1",name:"Contabilidade de Custos I",area:"Finanças e Contabilidade",semester:7,ch:50,prereqs:["controladoria"],competencies:["Custos","Formação de Preços"] },
  { id:"elab-proj1",name:"Elaboração e Avaliação de Projetos I",area:"Estratégia",semester:7,ch:75,prereqs:["plano-neg2","metod-pesq"],competencies:["Gestão de Projetos","Análise de Viabilidade"] },
  { id:"gest-qualidade",name:"Gestão da Qualidade",area:"Operações",semester:7,ch:50,prereqs:["adm-prod"],competencies:["Qualidade","ISO/Normas"] },
  { id:"logist1",name:"Logística Empresarial I",area:"Operações",semester:7,ch:50,prereqs:["adm-prod"],competencies:["Logística","Gestão de Transporte"] },
  { id:"pesq-oper1",name:"Pesquisa Operacional I",area:"Estratégia",semester:7,ch:50,prereqs:["estat2"],competencies:["Otimização","Modelagem Matemática"] },
  { id:"plan-estrat",name:"Planejamento Estratégico",area:"Estratégia",semester:7,ch:50,prereqs:["teoria-org2","mod-decisao"],competencies:["Planejamento Estratégico","OKRs/BSC"] },
  { id:"topicos-adm1",name:"Tópicos Avançados em Administração I",area:"Formação Básica",semester:7,ch:50,prereqs:["intro-adm"],competencies:["Administração Contemporânea","Tendências Gerenciais"] },
  { id:"ext-proj6",name:"Atividades de Extensão / Projeto Integrador VI",area:"Integração",semester:7,ch:85,prereqs:["ext-proj5"],competencies:["Consultoria Estratégica","Relatórios Executivos"] },
  { id:"gest-pessoas2",name:"Gestão de Pessoas II",area:"Gestão de Pessoas",semester:8,ch:50,prereqs:["gest-pessoas1"],competencies:["Desenvolvimento Organizacional","Cultura e Clima"] },
  { id:"fin-orc2",name:"Finanças e Orçamento II",area:"Finanças e Contabilidade",semester:8,ch:50,prereqs:["fin-orc1"],competencies:["Controle Orçamentário","Forecast"] },
  { id:"tend-mkt2",name:"Tendências de Marketing II",area:"Marketing",semester:8,ch:50,prereqs:["tend-mkt1"],competencies:["Marketing de Conteúdo","Analytics"] },
  { id:"cont-custos2",name:"Contabilidade de Custos II",area:"Finanças e Contabilidade",semester:8,ch:50,prereqs:["cont-custos1"],competencies:["Custeio ABC","Margem de Contribuição"] },
  { id:"elab-proj2",name:"Elaboração e Avaliação de Projetos II",area:"Estratégia",semester:8,ch:75,prereqs:["elab-proj1"],competencies:["Gestão de Portfólio","PMO"] },
  { id:"logist2",name:"Logística Empresarial II",area:"Operações",semester:8,ch:50,prereqs:["logist1"],competencies:["Supply Chain Avançado","Distribuição"] },
  { id:"pesq-oper2",name:"Pesquisa Operacional II",area:"Estratégia",semester:8,ch:50,prereqs:["pesq-oper1"],competencies:["Simulação","Programação Linear"] },
  { id:"topicos-adm2",name:"Tópicos Avançados em Administração II",area:"Formação Básica",semester:8,ch:50,prereqs:["topicos-adm1"],competencies:["Governança Corporativa","ESG"] },
  { id:"resolucao-prob",name:"Resolução Efetiva de Problemas",area:"Estratégia",semester:8,ch:50,prereqs:["plan-estrat"],competencies:["Problem Solving","Design Thinking"] },
  { id:"tcc",name:"TCC",area:"Integração",semester:8,ch:0,prereqs:["elab-proj2","metod-pesq"],competencies:["Pesquisa Acadêmica","Comunicação Executiva"] },
  { id:"estagio",name:"Estágio",area:"Integração",semester:8,ch:0,prereqs:[],competencies:["Experiência Profissional","Aplicação Prática"] },
  { id:"ativ-comp",name:"Atividades Complementares",area:"Integração",semester:8,ch:0,prereqs:[],competencies:["Desenvolvimento Pessoal","Visão Ampliada"] },
];

const careers = [
  { id:"financeiro",name:"Gestor Financeiro",icon:"📈",color:"#1d4ed8",description:"Responsável pela saúde financeira da empresa: fluxo de caixa, investimentos, análise de balanços e planejamento orçamentário.",disciplines:["mat-adm","mat-fin1","mat-fin2","cont1","cont2","adm-fin1","adm-fin2","anal-eco-fin","fin-orc1","fin-orc2","cont-custos1","cont-custos2","controladoria","gestao-cont"],competencies:["Análise Financeira","Contabilidade","Matemática Financeira","Planej. Orçamentário","Controladoria"],compWeights:[5,4,4,3,3],marketDemand:"Alta",avgSalary:"R$ 6.000 – R$ 12.000",topSkills:["Excel Avançado","Power BI","SAP/ERP","Valuation","IFRS"] },
  { id:"marketing",name:"Analista de Marketing",icon:"🎯",color:"#7c3aed",description:"Desenvolve estratégias de marca, comunicação e crescimento. Atua com dados, comportamento do consumidor e marketing digital.",disciplines:["fund-mkt","gest-mkt","dec-prod-preco","tend-mkt1","tend-mkt2","comp-hum-org","estat1","estat2"],competencies:["Marketing Digital","Comportamento do Cons.","Análise de Dados","Branding","Gestão de Produtos"],compWeights:[5,4,4,3,3],marketDemand:"Muito Alta",avgSalary:"R$ 4.500 – R$ 9.000",topSkills:["Google Analytics","Meta Ads","CRM","SEO/SEM","Copywriting"] },
  { id:"rh",name:"Especialista em RH",icon:"👥",color:"#047857",description:"Cuida do capital humano: recrutamento, desenvolvimento, cultura organizacional e gestão de performance.",disciplines:["psi-adm","comp-hum-org","form-lid","din-rel-inter","gest-pessoas1","gest-pessoas2","etica-crit"],competencies:["Gestão de Talentos","Liderança & Cultura","Psicologia Org.","Legislação Trab.","T&D"],compWeights:[5,4,4,3,3],marketDemand:"Média",avgSalary:"R$ 4.000 – R$ 8.000",topSkills:["People Analytics","HRIS/HCM","Entrevista por Comp.","OKRs","D&I"] },
  { id:"empreendedor",name:"Empreendedor",icon:"🚀",color:"#b45309",description:"Cria e escala negócios, seja como fundador de startup ou intraempreendedor dentro de grandes organizações.",disciplines:["cult-comp-emp","emp-startups","plano-neg1","plano-neg2","novos-modelos","gest-inov-emp","neg-disr","dir-empre-inov","adm-fin1"],competencies:["Modelagem de Negócios","Inovação & Produto","Finanças Básicas","Liderança","Vendas & Growth"],compWeights:[5,5,3,3,4],marketDemand:"Alta",avgSalary:"Variável",topSkills:["Lean Startup","Design Thinking","Pitch","Growth Hacking","Product Mgmt"] },
  { id:"operacoes",name:"Gestor de Operações",icon:"⚙️",color:"#dc2626",description:"Otimiza processos produtivos e cadeia de suprimentos para garantir eficiência, qualidade e redução de custos.",disciplines:["adm-rec-pat1","adm-rec-pat2","adm-prod","gest-qualidade","logist1","logist2","pesq-oper1","pesq-oper2"],competencies:["Supply Chain","Gestão da Qualidade","Pesquisa Operacional","Lean / Six Sigma","KPIs Operacionais"],compWeights:[5,4,4,4,3],marketDemand:"Alta",avgSalary:"R$ 5.500 – R$ 11.000",topSkills:["Lean Manufacturing","Six Sigma","ERP/SAP","Gestão de Projetos","Power BI"] },
  { id:"estrategia",name:"Consultor Estratégico",icon:"🔍",color:"#0891b2",description:"Analisa cenários e propõe soluções para desafios complexos de negócio, atuando em consultorias ou áreas de estratégia corporativa.",disciplines:["mod-decisao","teoria-org1","teoria-org2","plan-estrat","elab-proj1","elab-proj2","papel-adm-4rev","pesq-oper1"],competencies:["Análise Estratégica","Gestão de Projetos","Raciocínio Analítico","Comunicação Exec.","Modelagem de Cenários"],compWeights:[5,4,5,4,3],marketDemand:"Muito Alta",avgSalary:"R$ 8.000 – R$ 18.000",topSkills:["Frameworks Estratégicos","Excel/PPT Avançado","Python/SQL básico","Storytelling","Stakeholders"] },
];

const areaColors = { "Formação Básica":"#64748b","Finanças e Contabilidade":"#1d4ed8","Marketing":"#7c3aed","Gestão de Pessoas":"#047857","Estratégia":"#b45309","Operações":"#dc2626","Economia":"#0891b2","Empreendedorismo":"#d97706","Tecnologia e Inovação":"#6d28d9","Direito e Legislação":"#374151","Integração":"#9333ea" };

// ── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading }) {
  return (
    <div style={{ minHeight:"100vh",background:"#f8f9fb",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');`}</style>
      <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"48px 40px",width:380,textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
        <img src={UNIARA_LOGO_B64} alt="UNIARA" style={{ height:56,objectFit:"contain",marginBottom:24 }} />
        <h1 style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:"#1a1a2e",marginBottom:8 }}>Mapa de Aprendizagem</h1>
        <p style={{ fontSize:13,color:"#6b7280",marginBottom:32 }}>Administração · UNIARA · Araraquara</p>
        <button onClick={onLogin} disabled={loading} style={{ width:"100%",padding:"12px 0",borderRadius:9,border:"1px solid #e5e7eb",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:14,fontWeight:600,color:"#374151",cursor:loading?"wait":"pointer" }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>
        <p style={{ fontSize:11,color:"#9ca3af",marginTop:20 }}>Seu progresso ficará salvo automaticamente</p>
      </div>
    </div>
  );
}

// ── Radar Chart ──────────────────────────────────────────────────────────────
function RadarChart({ data, color, size=180 }) {
  const cx=size/2,cy=size/2,r=size*0.36,n=data.length;
  const angle=i=>(Math.PI*2*i)/n-Math.PI/2;
  const pt=(i,radius)=>[cx+radius*Math.cos(angle(i)),cy+radius*Math.sin(angle(i))];
  return (
    <svg width={size} height={size} style={{ overflow:"visible" }}>
      {[0.25,0.5,0.75,1].map(g=><polygon key={g} points={data.map((_,i)=>pt(i,r*g).join(",")).join(" ")} fill="none" stroke="#e5e7eb" strokeWidth="1"/>)}
      {data.map((_,i)=><line key={i} x1={cx} y1={cy} x2={pt(i,r)[0]} y2={pt(i,r)[1]} stroke="#e5e7eb" strokeWidth="1"/>)}
      <polygon points={data.map((d,i)=>pt(i,r*(d.value/5)).join(",")).join(" ")} fill={color+"28"} stroke={color} strokeWidth="2"/>
      {data.map((d,i)=>{ const [lx,ly]=pt(i,r*1.32),[dx,dy]=pt(i,r*(d.value/5)); return <g key={i}><circle cx={dx} cy={dy} r="3.5" fill={color}/><text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:9,fill:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:500 }}>{d.name}</text></g>;})}
    </svg>
  );
}

// ── Portfolio View ───────────────────────────────────────────────────────────
function PortfolioView({ user, completed, experiences, onAddExperience, onDeleteExperience, onShareLink }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:"Estágio",title:"",organization:"",startDate:"",endDate:"",current:false,description:"" });
  const autoComps = getAutoCompetencies(completed);
  const totalComps = autoComps.length;
  const totalDiscs = completed.size;

  const handleSubmit = async () => {
    if (!form.title || !form.organization) return;
    await onAddExperience(form);
    setForm({ type:"Estágio",title:"",organization:"",startDate:"",endDate:"",current:false,description:"" });
    setShowForm(false);
  };

  return (
    <div className="fade-in" style={{ padding:"24px 28px",overflowY:"auto",height:"100%" }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,color:"#1a1a2e" }}>Banco de Competências</h1>
          <p style={{ fontSize:13,color:"#6b7280",marginTop:3 }}>Seu portfólio acadêmico e profissional</p>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onShareLink} style={{ padding:"8px 14px",borderRadius:8,border:"1px solid #e5e7eb",background:"#fff",fontSize:12,fontWeight:600,color:"#374151",cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>🔗 Copiar link</button>
          <button onClick={()=>window.print()} style={{ padding:"8px 14px",borderRadius:8,border:"1px solid #1d4ed8",background:"#1d4ed8",fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>📄 Exportar PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20 }}>
        {[
          ["🎓","Disciplinas","Concluídas",totalDiscs,disciplines.length,"#1d4ed8"],
          ["🧠","Competências","Adquiridas",totalComps,"—","#7c3aed"],
          ["💼","Experiências","Registradas",experiences.length,"—","#047857"],
          ["📊","Progresso","Geral",Math.round((completed.size/disciplines.length)*100)+"%","—","#b45309"],
        ].map(([icon,l1,l2,v,total,color])=>(
          <div key={l1} style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"14px 16px" }}>
            <div style={{ fontSize:20,marginBottom:6 }}>{icon}</div>
            <div style={{ fontSize:22,fontWeight:700,color }}>{v}{total!=="—"&&<span style={{ fontSize:11,color:"#9ca3af",fontWeight:400 }}>/{total}</span>}</div>
            <div style={{ fontSize:11,color:"#6b7280" }}>{l1} {l2}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:14 }}>
        {/* Competências automáticas */}
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ fontSize:12,fontWeight:700,color:"#1a1a2e",marginBottom:4 }}>🧠 Competências Adquiridas</div>
          <p style={{ fontSize:11,color:"#9ca3af",marginBottom:14 }}>Geradas automaticamente pelas disciplinas concluídas</p>
          {autoComps.length === 0 ? (
            <p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>Conclua disciplinas para gerar competências automaticamente.</p>
          ) : (
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {autoComps.map(c=>(
                <div key={c.name} style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"#eff6ff",borderRadius:6,border:"1px solid #bfdbfe" }}>
                  <span style={{ fontSize:11,fontWeight:600,color:"#1d4ed8" }}>{c.name}</span>
                  <span style={{ fontSize:9,background:"#1d4ed8",color:"#fff",borderRadius:8,padding:"0 5px",fontWeight:700 }}>{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experiências */}
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#1a1a2e" }}>💼 Experiências</div>
            <button onClick={()=>setShowForm(!showForm)} style={{ padding:"4px 10px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer" }}>+ Adicionar</button>
          </div>
          <p style={{ fontSize:11,color:"#9ca3af",marginBottom:14 }}>Estágios, projetos, voluntariado e mais</p>

          {showForm && (
            <div style={{ background:"#f9fafb",borderRadius:10,padding:14,marginBottom:14,border:"1px solid #e5e7eb" }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,background:"#fff" }}>
                  {EXP_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
                <input placeholder="Título / Cargo" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />
                <input placeholder="Empresa / Instituição" value={form.organization} onChange={e=>setForm(f=>({...f,organization:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />
                <input type="month" placeholder="Início" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />
                {!form.current && <input type="month" placeholder="Fim" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />}
                <label style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#374151" }}><input type="checkbox" checked={form.current} onChange={e=>setForm(f=>({...f,current:e.target.checked}))} /> Atual</label>
              </div>
              <textarea placeholder="Descrição (atividades, resultados, aprendizados...)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{ width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,resize:"vertical",fontFamily:"inherit" }} />
              <div style={{ display:"flex",gap:6,marginTop:8 }}>
                <button onClick={handleSubmit} style={{ flex:1,padding:"7px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer" }}>Salvar</button>
                <button onClick={()=>setShowForm(false)} style={{ padding:"7px 14px",borderRadius:6,border:"1px solid #e5e7eb",background:"#fff",fontSize:12,color:"#6b7280",cursor:"pointer" }}>Cancelar</button>
              </div>
            </div>
          )}

          {experiences.length === 0 ? (
            <p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>Nenhuma experiência adicionada ainda.</p>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {experiences.map(exp=>(
                <div key={exp.id} style={{ padding:"10px 12px",borderRadius:8,border:"1px solid #e5e7eb",background:"#fafafa" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
                        <span style={{ fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:4,background:"#eff6ff",color:"#1d4ed8" }}>{exp.type}</span>
                        {exp.current && <span style={{ fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:"#dcfce7",color:"#047857" }}>ATUAL</span>}
                      </div>
                      <div style={{ fontSize:12,fontWeight:600,color:"#1a1a2e" }}>{exp.title}</div>
                      <div style={{ fontSize:11,color:"#6b7280" }}>{exp.organization}</div>
                      {(exp.startDate||exp.endDate) && <div style={{ fontSize:10,color:"#9ca3af",marginTop:2 }}>{exp.startDate||""}{exp.endDate&&!exp.current?" → "+exp.endDate:exp.current?" → Atual":""}</div>}
                      {exp.description && <div style={{ fontSize:11,color:"#374151",marginTop:4,lineHeight:1.5 }}>{exp.description}</div>}
                    </div>
                    <button onClick={()=>onDeleteExperience(exp.id)} style={{ background:"none",border:"none",color:"#d1d5db",cursor:"pointer",fontSize:14,lineHeight:1 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Career coverage */}
      <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18,marginTop:14 }}>
        <div style={{ fontSize:12,fontWeight:700,color:"#1a1a2e",marginBottom:14 }}>🎯 Cobertura por Trilha de Carreira</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
          {careers.map(c=>{ const pct=Math.round((c.disciplines.filter(id=>completed.has(id)).length/c.disciplines.length)*100); return (
            <div key={c.id} style={{ padding:"10px 12px",borderRadius:8,border:`1px solid ${c.color}22`,background:`${c.color}06` }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:7 }}><span style={{ fontSize:15 }}>{c.icon}</span><span style={{ fontSize:12,fontWeight:600,color:"#1a1a2e" }}>{c.name}</span><span style={{ marginLeft:"auto",fontSize:12,fontWeight:700,color:c.color }}>{pct}%</span></div>
              <div style={{ height:5,background:"#e5e7eb",borderRadius:3,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:c.color,borderRadius:3,transition:"width 0.5s" }}/></div>
            </div>
          );})}
        </div>
      </div>

      <style>{`@media print { button { display: none !important; } }`}</style>
    </div>
  );
}

// ── Health Score ─────────────────────────────────────────────────────────────
function calcHealthScore(s, avgProgress) {
  let score = 0;
  const factors = [];

  // Fator 1 — Semestre atrasado vs progresso (peso 40)
  // Esperado: aluno no semestre X deveria ter ~(X/8)*100% de progresso
  // Usamos o semesterAtTime mais alto registrado como proxy do semestre atual
  const expectedProgress = s.estimatedSemester ? Math.round((s.estimatedSemester / 8) * 100) : null;
  if (expectedProgress !== null) {
    const gap = expectedProgress - s.progress;
    if (gap > 40) { score += 40; factors.push({ label:"Muito atrasado no progresso", severity:"critical" }); }
    else if (gap > 25) { score += 28; factors.push({ label:"Progresso abaixo do esperado", severity:"high" }); }
    else if (gap > 10) { score += 15; factors.push({ label:"Leve atraso no progresso", severity:"medium" }); }
  }

  // Fator 2 — Dias sem atividade no app (peso 35)
  if (s.daysSinceActivity === null) {
    score += 20; factors.push({ label:"Sem histórico de atividade", severity:"medium" });
  } else if (s.daysSinceActivity > 60) {
    score += 35; factors.push({ label:`${s.daysSinceActivity} dias sem acessar`, severity:"critical" });
  } else if (s.daysSinceActivity > 30) {
    score += 22; factors.push({ label:`${s.daysSinceActivity} dias sem acessar`, severity:"high" });
  } else if (s.daysSinceActivity > 14) {
    score += 10; factors.push({ label:`${s.daysSinceActivity} dias sem acessar`, severity:"medium" });
  }

  // Fator 3 — Zero experiências registradas (peso 25)
  if (s.experienceCount === 0 && s.progress > 30) {
    score += 25; factors.push({ label:"Nenhuma experiência registrada", severity:"high" });
  } else if (s.experienceCount === 0) {
    score += 10; factors.push({ label:"Nenhuma experiência ainda", severity:"medium" });
  }

  // Normaliza 0-100
  score = Math.min(100, score);

  let level, color, bg, label;
  if (score >= 75)      { level="crítico";  color="#dc2626"; bg="#fee2e2"; label="🔴 Crítico"; }
  else if (score >= 50) { level="alto";     color="#ea580c"; bg="#ffedd5"; label="🟠 Alto"; }
  else if (score >= 25) { level="médio";    color="#d97706"; bg="#fef3c7"; label="🟡 Médio"; }
  else                  { level="baixo";    color="#047857"; bg="#dcfce7"; label="🟢 Baixo"; }

  return { score, level, color, bg, label, factors };
}

// ── Coordinator Dashboard ────────────────────────────────────────────────────
function CoordDashboard({ allStudents }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("risco");
  const [filterRisk, setFilterRisk] = useState("todos");
  const [expandedStudent, setExpandedStudent] = useState(null);

  const avgProgress = allStudents.length ? Math.round(allStudents.reduce((a,s)=>a+s.progress,0)/allStudents.length) : 0;
  const avgComps = allStudents.length ? Math.round(allStudents.reduce((a,s)=>a+(s.competencyCount||0),0)/allStudents.length) : 0;

  // Enriquece com score
  const studentsWithScore = allStudents.map(s => ({
    ...s,
    health: calcHealthScore(s, avgProgress)
  }));

  const riskCounts = {
    crítico: studentsWithScore.filter(s=>s.health.level==="crítico").length,
    alto:    studentsWithScore.filter(s=>s.health.level==="alto").length,
    médio:   studentsWithScore.filter(s=>s.health.level==="médio").length,
    baixo:   studentsWithScore.filter(s=>s.health.level==="baixo").length,
  };

  const filtered = studentsWithScore
    .filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
      const matchRisk = filterRisk === "todos" || s.health.level === filterRisk;
      return matchSearch && matchRisk;
    })
    .sort((a,b) => {
      if (sortBy === "risco")    return b.health.score - a.health.score;
      if (sortBy === "progress") return b.progress - a.progress;
      return a.name?.localeCompare(b.name);
    });

  return (
    <div className="fade-in" style={{ padding:"24px 28px", overflowY:"auto", height:"100%" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, fontWeight:400, color:"#1a1a2e" }}>Dashboard do Coordenador</h1>
        <p style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Acompanhamento individual e score de saúde acadêmica</p>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        {[
          ["👨‍🎓","Alunos","Cadastrados", allStudents.length, "#1d4ed8"],
          ["📊","Progresso","Médio", avgProgress+"%", "#7c3aed"],
          ["🧠","Competências","Média por aluno", avgComps, "#047857"],
          ["⚠️","Em risco","Alto ou Crítico", riskCounts.crítico + riskCounts.alto, "#dc2626"],
        ].map(([icon,l1,l2,v,color])=>(
          <div key={l1} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:"14px 16px" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
            <div style={{ fontSize:26, fontWeight:700, color }}>{v}</div>
            <div style={{ fontSize:11, color:"#6b7280" }}>{l1} {l2}</div>
          </div>
        ))}
      </div>

      {/* Risk distribution */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:18, marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#1a1a2e", marginBottom:14 }}>🎯 Distribuição de Risco de Evasão</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[
            ["🔴","Crítico","crítico", riskCounts.crítico,"#dc2626","#fee2e2"],
            ["🟠","Alto","alto",       riskCounts.alto,    "#ea580c","#ffedd5"],
            ["🟡","Médio","médio",     riskCounts.médio,   "#d97706","#fef3c7"],
            ["🟢","Baixo","baixo",     riskCounts.baixo,   "#047857","#dcfce7"],
          ].map(([icon,label,level,count,color,bg])=>(
            <div key={label} onClick={()=>setFilterRisk(filterRisk===level?"todos":level)} style={{ textAlign:"center", padding:"14px 8px", borderRadius:8, background:filterRisk===level?bg:"#f9fafb", border:`1.5px solid ${filterRisk===level?color:"#e5e7eb"}`, cursor:"pointer", transition:"all 0.15s" }}>
              <div style={{ fontSize:22 }}>{icon}</div>
              <div style={{ fontSize:26, fontWeight:700, color }}>{count}</div>
              <div style={{ fontSize:11, fontWeight:600, color }}>{label}</div>
              <div style={{ fontSize:9, color:"#9ca3af", marginTop:2 }}>clique para filtrar</div>
            </div>
          ))}
        </div>
        {/* Barra visual proporcional */}
        {allStudents.length > 0 && (
          <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", marginTop:14, gap:1 }}>
            {[["#dc2626",riskCounts.crítico],["#ea580c",riskCounts.alto],["#d97706",riskCounts.médio],["#047857",riskCounts.baixo]].map(([color,count],i)=>(
              count > 0 && <div key={i} style={{ flex:count, background:color, transition:"flex 0.5s" }}/>
            ))}
          </div>
        )}
      </div>

      {/* Student table */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#1a1a2e", flex:1 }}>
            👨‍🎓 Alunos
            {filterRisk !== "todos" && <span style={{ marginLeft:8, fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:6, background:"#eff6ff", color:"#1d4ed8" }}>Filtro: {filterRisk}</span>}
          </div>
          <input placeholder="Buscar por nome ou e-mail..." value={search} onChange={e=>setSearch(e.target.value)} style={{ padding:"6px 12px", borderRadius:7, border:"1px solid #e5e7eb", fontSize:12, width:220 }}/>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"6px 8px", borderRadius:7, border:"1px solid #e5e7eb", fontSize:12 }}>
            <option value="risco">Ordenar: Maior Risco</option>
            <option value="progress">Ordenar: Progresso</option>
            <option value="name">Ordenar: Nome</option>
          </select>
        </div>

        {allStudents.length === 0 ? (
          <p style={{ fontSize:13, color:"#9ca3af", fontStyle:"italic", textAlign:"center", padding:"20px 0" }}>Nenhum aluno cadastrado ainda.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {filtered.map(s => {
              const h = s.health;
              const isExpanded = expandedStudent === s.uid;
              return (
                <div key={s.uid} style={{ borderRadius:9, border:`1.5px solid ${isExpanded ? h.color : "#e5e7eb"}`, overflow:"hidden", transition:"border 0.2s" }}>
                  {/* Row principal */}
                  <div onClick={()=>setExpandedStudent(isExpanded ? null : s.uid)} style={{ display:"grid", gridTemplateColumns:"32px 1fr 150px 65px 65px 65px 100px", gap:10, alignItems:"center", padding:"10px 14px", background:isExpanded ? h.bg : "#f9fafb", cursor:"pointer" }}>
                    {s.photoURL
                      ? <img src={s.photoURL} style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid #e5e7eb" }} alt=""/>
                      : <div style={{ width:28, height:28, borderRadius:"50%", background:"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"#6b7280" }}>{s.name?.[0]||"?"}</div>
                    }
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#1a1a2e" }}>{s.name||"Sem nome"}</div>
                      <div style={{ fontSize:10, color:"#9ca3af" }}>{s.email}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ flex:1, height:5, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:`${s.progress}%`, height:"100%", background:s.progress>=70?"#047857":s.progress>=40?"#1d4ed8":"#f59e0b", borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:"#374151", minWidth:28 }}>{s.progress}%</span>
                    </div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:700, color:"#1d4ed8" }}>{s.completedCount}</div><div style={{ fontSize:9, color:"#9ca3af" }}>discs.</div></div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:700, color:"#7c3aed" }}>{s.competencyCount||0}</div><div style={{ fontSize:9, color:"#9ca3af" }}>comps.</div></div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:700, color:"#047857" }}>{s.experienceCount||0}</div><div style={{ fontSize:9, color:"#9ca3af" }}>exps.</div></div>
                    {/* Score de risco */}
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ flex:1, height:6, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:`${h.score}%`, height:"100%", background:h.color, borderRadius:3, transition:"width 0.5s" }}/>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background:h.bg, color:h.color, whiteSpace:"nowrap" }}>{h.label}</span>
                    </div>
                  </div>

                  {/* Painel expandido com fatores */}
                  {isExpanded && (
                    <div style={{ padding:"12px 14px 14px", background:"#fff", borderTop:`1px solid ${h.color}30` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:8 }}>Fatores de risco identificados:</div>
                      {h.factors.length === 0 ? (
                        <div style={{ fontSize:12, color:"#047857" }}>✅ Nenhum fator de risco identificado. Aluno em boa trajetória!</div>
                      ) : (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {h.factors.map((f,i) => (
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:6, background:f.severity==="critical"?"#fee2e2":f.severity==="high"?"#ffedd5":"#fef3c7", border:`1px solid ${f.severity==="critical"?"#fca5a5":f.severity==="high"?"#fdba74":"#fde68a"}` }}>
                              <span style={{ fontSize:11 }}>{f.severity==="critical"?"🔴":f.severity==="high"?"🟠":"🟡"}</span>
                              <span style={{ fontSize:11, fontWeight:500, color:"#374151" }}>{f.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:8, marginTop:10 }}>
                        <div style={{ fontSize:11, color:"#9ca3af" }}>
                          {s.daysSinceActivity !== null ? `Última atividade: há ${s.daysSinceActivity} dia${s.daysSinceActivity!==1?"s":""}` : "Sem registro de atividade"}
                          {s.recentActivity > 0 && ` · ${s.recentActivity} disciplinas nos últimos 60 dias`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Gap Analysis ─────────────────────────────────────────────────────────────
function GapAnalysis({ completed, isUnlocked, toggleCompleted, setSelectedDisc }) {
  const [selected, setSelected] = useState(careers[0].id);
  const career = careers.find(c=>c.id===selected);
  const careerDiscs = disciplines.filter(d=>career.disciplines.includes(d.id));
  const doneDiscs = careerDiscs.filter(d=>completed.has(d.id));
  const missingDiscs = careerDiscs.filter(d=>!completed.has(d.id));
  const nextUnlocked = missingDiscs.filter(d=>isUnlocked(d));
  const stillBlocked = missingDiscs.filter(d=>!isUnlocked(d));
  const pct = Math.round((doneDiscs.length/Math.max(careerDiscs.length,1))*100);
  const doneFrac = doneDiscs.length/Math.max(careerDiscs.length,1);
  const radarData = career.competencies.map((name,i)=>({ name,value:Math.min(5,Math.max(1,Math.round(career.compWeights[i]*doneFrac+0.5))) }));
  const demandColor = { "Muito Alta":"#047857","Alta":"#1d4ed8","Média":"#b45309" };
  return (
    <div className="fade-in" style={{ padding:"24px 28px",overflowY:"auto",height:"100%" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,color:"#1a1a2e" }}>Gap Analysis de Carreira</h1>
        <p style={{ fontSize:13,color:"#6b7280",marginTop:3 }}>Compare seu progresso com as exigências de cada trilha profissional</p>
      </div>
      <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:22 }}>
        {careers.map(c=>{ const p=Math.round((disciplines.filter(d=>c.disciplines.includes(d.id)&&completed.has(d.id)).length/c.disciplines.length)*100); return (
          <button key={c.id} onClick={()=>setSelected(c.id)} className="nav-btn" style={{ padding:"7px 13px",borderRadius:8,fontSize:12,fontWeight:600,border:`1.5px solid ${selected===c.id?c.color:"#e5e7eb"}`,background:selected===c.id?`${c.color}10`:"#fff",color:selected===c.id?c.color:"#6b7280",display:"flex",alignItems:"center",gap:6 }}>
            <span>{c.icon}</span><span>{c.name}</span><span style={{ background:selected===c.id?c.color:"#e5e7eb",color:selected===c.id?"#fff":"#9ca3af",borderRadius:10,padding:"0 6px",fontSize:10 }}>{p}%</span>
          </button>
        );})}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.1fr 1fr 1fr",gap:12,marginBottom:14 }}>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:`${career.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{career.icon}</div>
            <div><div style={{ fontSize:14,fontWeight:700,color:"#1a1a2e" }}>{career.name}</div><div style={{ fontSize:10,color:career.color,fontWeight:600 }}>TRILHA DE CARREIRA</div></div>
          </div>
          <p style={{ fontSize:12,color:"#6b7280",lineHeight:1.6,marginBottom:14 }}>{career.description}</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14 }}>
            {[["DEMANDA",career.marketDemand,demandColor[career.marketDemand]],["SALÁRIO MÉDIO",career.avgSalary,"#1a1a2e"]].map(([l,v,clr])=>(
              <div key={l} style={{ background:"#f9fafb",borderRadius:8,padding:"8px 10px" }}><div style={{ fontSize:9,color:"#9ca3af",marginBottom:2 }}>{l}</div><div style={{ fontSize:11,fontWeight:700,color:clr }}>{v}</div></div>
            ))}
          </div>
          <div style={{ fontSize:10,fontWeight:600,color:"#9ca3af",letterSpacing:"0.4px",marginBottom:7 }}>SKILLS DO MERCADO</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{career.topSkills.map(s=><span key={s} style={{ fontSize:10,padding:"3px 8px",background:`${career.color}10`,color:career.color,borderRadius:4,fontWeight:500 }}>{s}</span>)}</div>
        </div>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18,display:"flex",flexDirection:"column",alignItems:"center" }}>
          <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px",marginBottom:12,alignSelf:"flex-start" }}>SEU PERFIL DE COMPETÊNCIAS</div>
          <RadarChart data={radarData} color={career.color} size={185}/>
          <div style={{ textAlign:"center",marginTop:10 }}><div style={{ fontSize:26,fontWeight:700,color:career.color }}>{pct}%</div><div style={{ fontSize:11,color:"#9ca3af" }}>cobertura da trilha</div></div>
        </div>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px",marginBottom:14 }}>PROGRESSO DETALHADO</div>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}><span style={{ fontSize:12,fontWeight:600,color:"#1a1a2e" }}>Disciplinas concluídas</span><span style={{ fontSize:12,fontWeight:700,color:career.color }}>{doneDiscs.length}/{careerDiscs.length}</span></div>
            <div style={{ height:8,background:"#e5e7eb",borderRadius:4,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:career.color,borderRadius:4,transition:"width 0.6s ease" }}/></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16 }}>
            {[["Concluídas",doneDiscs.length,"#047857","#f0fdf4"],["Disponíveis",nextUnlocked.length,career.color,`${career.color}10`],["Bloqueadas",stillBlocked.length,"#9ca3af","#f9fafb"]].map(([l,v,c,bg])=>(
              <div key={l} style={{ background:bg,borderRadius:8,padding:"8px 6px",textAlign:"center" }}><div style={{ fontSize:20,fontWeight:700,color:c }}>{v}</div><div style={{ fontSize:9,color:c,fontWeight:500 }}>{l}</div></div>
            ))}
          </div>
          <div style={{ padding:"10px 12px",borderRadius:8,background:pct>=80?"#f0fdf4":pct>=40?"#eff6ff":"#fefce8",border:`1px solid ${pct>=80?"#bbf7d0":pct>=40?"#bfdbfe":"#fde68a"}` }}>
            <div style={{ fontSize:11,fontWeight:700,color:pct>=80?"#047857":pct>=40?"#1d4ed8":"#b45309",marginBottom:2 }}>{pct>=80?"✅ Pronto para o mercado!":pct>=40?"📚 Em bom progresso":"🌱 Início da jornada"}</div>
            <div style={{ fontSize:11,color:"#6b7280" }}>{pct>=80?"Você cobriu a maior parte das disciplinas desta trilha.":pct>=40?`Faltam ${missingDiscs.length} disciplinas para completar.`:"Complete as disciplinas disponíveis para avançar."}</div>
          </div>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px" }}>DISPONÍVEIS AGORA</div>
            <span style={{ fontSize:10,background:`${career.color}12`,color:career.color,padding:"1px 8px",borderRadius:10,fontWeight:600 }}>{nextUnlocked.length} disciplinas</span>
          </div>
          {nextUnlocked.length===0?<p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>{missingDiscs.length===0?"🎉 Trilha completa!":"Complete os pré-requisitos primeiro."}</p>:(
            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              {nextUnlocked.map(disc=>(
                <div key={disc.id} onClick={()=>setSelectedDisc(disc.id)} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:7,background:"#f9fafb",cursor:"pointer" }}>
                  <div style={{ width:7,height:7,borderRadius:2,background:career.color,flexShrink:0 }}/>
                  <span style={{ fontSize:12,color:"#374151",flex:1 }}>{disc.name}</span>
                  <span style={{ fontSize:10,color:"#9ca3af" }}>{disc.semester}º sem.</span>
                  <div onClick={e=>{e.stopPropagation();toggleCompleted(disc.id);}} style={{ width:18,height:18,borderRadius:4,border:`1.5px solid ${career.color}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:career.color,fontSize:12,fontWeight:700 }}>+</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px" }}>JÁ CONCLUÍDAS NESTA TRILHA</div>
            <span style={{ fontSize:10,background:"#f0fdf4",color:"#047857",padding:"1px 8px",borderRadius:10,fontWeight:600 }}>{doneDiscs.length} disciplinas</span>
          </div>
          {doneDiscs.length===0?<p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>Nenhuma disciplina concluída nesta trilha ainda.</p>:(
            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              {doneDiscs.map(disc=>(
                <div key={disc.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:7 }}>
                  <div style={{ width:16,height:16,borderRadius:4,background:"#1d4ed8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg></div>
                  <span style={{ fontSize:12,color:"#374151" }}>{disc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscCard({ disc, completed, isUnlocked, toggleCompleted, setSelectedDisc, selectedDisc }) {
  const done = completed.has(disc.id);
  const unlocked = isUnlocked(disc);
  const color = areaColors[disc.area];
  const isSelected = selectedDisc === disc.id;
  return (
    <div className="disc-card" onClick={()=>setSelectedDisc(disc.id)}
      style={{ background:done?T.grad1:"#fff", border:`1.5px solid ${isSelected?(done?"rgba(255,255,255,0.4)":T.primary):done?"transparent":unlocked?T.border:"#f1f5f9"}`,
        borderRadius:12, padding:"12px 12px 10px", opacity:!unlocked&&!done?0.5:1,
        boxShadow:done?T.shadowMd:isSelected?`0 0 0 2px ${T.primary}33`:T.shadow }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ padding:"2px 7px", background:done?"rgba(255,255,255,0.18)":`${color}12`, borderRadius:4, fontSize:9, fontWeight:700, color:done?"rgba(255,255,255,0.85)":color, maxWidth:"80%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"0.3px" }}>
          {disc.area.toUpperCase()}
        </div>
        <div className="check-anim" onClick={e=>{e.stopPropagation();if(unlocked||done)toggleCompleted(disc.id);}}
          style={{ width:20, height:20, borderRadius:5, border:done?"none":`1.5px solid ${unlocked?T.border:"#e2e8f0"}`,
            background:done?"rgba(255,255,255,0.25)":"transparent", display:"flex", alignItems:"center", justifyContent:"center",
            cursor:unlocked||done?"pointer":"default", flexShrink:0, color:"#fff" }}>
          {done && <Icon.Check/>}
        </div>
      </div>
      <div style={{ fontSize:12, fontWeight:500, color:done?"#fff":unlocked?T.text:T.subtle, lineHeight:1.4, marginBottom:9, minHeight:34 }}>
        {disc.name}
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, color:done?"rgba(255,255,255,0.6)":T.subtle }}>{disc.ch>0?`${disc.ch}h`:"—"} · {disc.semester}º sem.</span>
        {!unlocked&&!done && <span style={{ color:T.subtle, display:"flex" }}><Icon.Lock/></span>}
        {unlocked&&!done && <span style={{ fontSize:9, fontWeight:700, color:T.primary, background:`${T.primary}12`, padding:"2px 6px", borderRadius:4 }}>LIVRE</span>}
      </div>
    </div>
  );
}

// ── Vagas View ───────────────────────────────────────────────────────────────
function VagasView({ user, completed, isCoord, vagas, onAddVaga, onDeleteVaga, onCandidatar, candidaturas }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("todas");
  const [form, setForm] = useState({ titulo:"",empresa:"",area:"",carreira:"",semestre_min:1,descricao:"",salario:"",prazo:"",link_externo:"",tipo:"Estágio" });

  const TIPOS = ["Estágio","Emprego","Trainee","Freelance"];

  const handleSubmit = async () => {
    if (!form.titulo || !form.empresa) return;
    await onAddVaga({ ...form, criadoEm: new Date().toISOString() });
    setForm({ titulo:"",empresa:"",area:"",carreira:"",semestre_min:1,descricao:"",salario:"",prazo:"",link_externo:"",tipo:"Estágio" });
    setShowForm(false);
  };

  const getMatch = (vaga) => {
    if (!vaga.carreira) return null;
    const career = careers.find(c => c.id === vaga.carreira);
    if (!career) return null;
    const done = career.disciplines.filter(id => completed.has(id)).length;
    return Math.round((done / career.disciplines.length) * 100);
  };

  const myCands = new Set(candidaturas.filter(c => c.uid === user.uid).map(c => c.vagaId));

  const filtered = vagas.filter(v => {
    if (filter === "minhas") return myCands.has(v.id);
    if (filter === "match") { const m = getMatch(v); return m !== null && m >= 50; }
    return true;
  });

  const matchColor = m => m >= 75 ? "#047857" : m >= 50 ? "#1d4ed8" : m >= 25 ? "#b45309" : "#9ca3af";

  return (
    <div className="fade-in" style={{ padding:"24px 28px", overflowY:"auto", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, fontWeight:400, color:"#1a1a2e" }}>Vagas de Estágio e Emprego</h1>
          <p style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Oportunidades selecionadas pela coordenação</p>
        </div>
        {isCoord && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding:"9px 16px", borderRadius:8, border:"none", background:"#1d4ed8", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            + Nova Vaga
          </button>
        )}
      </div>

      {/* Formulário de cadastro (coordenador) */}
      {isCoord && showForm && (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #bfdbfe", padding:20, marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1a1a2e", marginBottom:14 }}>Nova Vaga</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
            <input placeholder="Título da vaga*" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <input placeholder="Empresa*" value={form.empresa} onChange={e=>setForm(f=>({...f,empresa:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, background:"#fff" }}>
              {TIPOS.map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={form.carreira} onChange={e=>setForm(f=>({...f,carreira:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, background:"#fff" }}>
              <option value="">Trilha de carreira (opcional)</option>
              {careers.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={form.semestre_min} onChange={e=>setForm(f=>({...f,semestre_min:Number(e.target.value)}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, background:"#fff" }}>
              {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>{s}º semestre (mínimo)</option>)}
            </select>
            <input placeholder="Salário / Bolsa (ex: R$ 1.500)" value={form.salario} onChange={e=>setForm(f=>({...f,salario:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <input type="date" placeholder="Prazo" value={form.prazo} onChange={e=>setForm(f=>({...f,prazo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <input placeholder="Link externo (opcional)" value={form.link_externo} onChange={e=>setForm(f=>({...f,link_externo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
          </div>
          <textarea placeholder="Descrição da vaga, requisitos, benefícios..." value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} rows={3} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, resize:"vertical", fontFamily:"inherit", marginBottom:10 }}/>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleSubmit} style={{ flex:1, padding:"9px", borderRadius:7, border:"none", background:"#1d4ed8", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Publicar Vaga</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:"9px 18px", borderRadius:7, border:"1px solid #e5e7eb", background:"#fff", fontSize:13, color:"#6b7280", cursor:"pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {[["todas","Todas as vagas"],["match","Match ≥ 50%"],["minhas","Minhas candidaturas"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} className="nav-btn" style={{ padding:"6px 14px", borderRadius:7, border:`1.5px solid ${filter===v?"#1d4ed8":"#e5e7eb"}`, background:filter===v?"#eff6ff":"#fff", color:filter===v?"#1d4ed8":"#6b7280", fontSize:12, fontWeight:filter===v?600:400 }}>{l}</button>
        ))}
        <div style={{ marginLeft:"auto", fontSize:12, color:"#9ca3af", display:"flex", alignItems:"center" }}>{filtered.length} vaga{filtered.length!==1?"s":""}</div>
      </div>

      {/* Lista de vagas */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 0", color:"#9ca3af" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
          <div style={{ fontSize:14, fontWeight:500 }}>{vagas.length === 0 ? "Nenhuma vaga cadastrada ainda." : "Nenhuma vaga encontrada com esse filtro."}</div>
          {isCoord && vagas.length === 0 && <div style={{ fontSize:12, marginTop:4 }}>Clique em "+ Nova Vaga" para começar.</div>}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:14 }}>
          {filtered.map(vaga => {
            const match = getMatch(vaga);
            const career = vaga.carreira ? careers.find(c=>c.id===vaga.carreira) : null;
            const jaCandidatou = myCands.has(vaga.id);
            const candCount = candidaturas.filter(c=>c.vagaId===vaga.id).length;
            const prazoExpirado = vaga.prazo && new Date(vaga.prazo) < new Date();
            return (
              <div key={vaga.id} style={{ background:"#fff", borderRadius:12, border:`1.5px solid ${jaCandidatou?"#bfdbfe":"#e5e7eb"}`, padding:18, display:"flex", flexDirection:"column", gap:10, position:"relative" }}>
                {jaCandidatou && <div style={{ position:"absolute", top:12, right:12, fontSize:10, fontWeight:700, background:"#eff6ff", color:"#1d4ed8", padding:"2px 8px", borderRadius:6 }}>✓ Candidatado</div>}

                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:9, background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏢</div>
                  <div style={{ flex:1, paddingRight: jaCandidatou ? 80 : 0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#1a1a2e", lineHeight:1.3 }}>{vaga.titulo}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{vaga.empresa}</div>
                  </div>
                </div>

                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"#f3f4f6", color:"#374151" }}>{vaga.tipo}</span>
                  {career && <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:`${career.color}12`, color:career.color }}>{career.icon} {career.name}</span>}
                  {vaga.semestre_min > 1 && <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"#fef3c7", color:"#b45309" }}>A partir do {vaga.semestre_min}º sem.</span>}
                  {prazoExpirado && <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"#fee2e2", color:"#dc2626" }}>Prazo encerrado</span>}
                </div>

                {vaga.descricao && <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.5, margin:0 }}>{vaga.descricao}</p>}

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {vaga.salario && <div style={{ background:"#f9fafb", borderRadius:7, padding:"6px 9px" }}><div style={{ fontSize:9, color:"#9ca3af" }}>SALÁRIO / BOLSA</div><div style={{ fontSize:12, fontWeight:600, color:"#1a1a2e" }}>{vaga.salario}</div></div>}
                  {vaga.prazo && <div style={{ background:"#f9fafb", borderRadius:7, padding:"6px 9px" }}><div style={{ fontSize:9, color:"#9ca3af" }}>PRAZO</div><div style={{ fontSize:12, fontWeight:600, color: prazoExpirado?"#dc2626":"#1a1a2e" }}>{new Date(vaga.prazo+"T12:00:00").toLocaleDateString("pt-BR")}</div></div>}
                </div>

                {match !== null && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1, height:5, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}><div style={{ width:`${match}%`, height:"100%", background:matchColor(match), borderRadius:3 }}/></div>
                    <span style={{ fontSize:11, fontWeight:700, color:matchColor(match), minWidth:40 }}>{match}% match</span>
                  </div>
                )}

                <div style={{ display:"flex", gap:7, alignItems:"center", marginTop:2 }}>
                  {!prazoExpirado && !isCoord && (
                    <button onClick={()=>!jaCandidatou&&onCandidatar(vaga.id)} disabled={jaCandidatou} style={{ flex:1, padding:"8px", borderRadius:7, border:"none", background:jaCandidatou?"#f3f4f6":"#1d4ed8", color:jaCandidatou?"#9ca3af":"#fff", fontSize:12, fontWeight:600, cursor:jaCandidatou?"default":"pointer" }}>
                      {jaCandidatou ? "✓ Candidatura enviada" : "Candidatar-se"}
                    </button>
                  )}
                  {vaga.link_externo && (
                    <a href={vaga.link_externo} target="_blank" rel="noreferrer" style={{ padding:"8px 12px", borderRadius:7, border:"1px solid #e5e7eb", background:"#fff", fontSize:12, color:"#6b7280", textDecoration:"none", fontWeight:500 }}>🔗 Ver site</a>
                  )}
                  {isCoord && (
                    <>
                      <div style={{ fontSize:11, color:"#9ca3af", flex:1 }}>{candCount} candidatura{candCount!==1?"s":""}</div>
                      <button onClick={()=>onDeleteVaga(vaga.id)} style={{ padding:"6px 10px", borderRadius:6, border:"1px solid #fee2e2", background:"#fff", color:"#dc2626", fontSize:11, cursor:"pointer" }}>Remover</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const [completedMeta, setCompletedMeta] = useState({}); // { discId: { completedAt, semesterAtTime } }
  const [experiences, setExperiences] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [mainView, setMainView] = useState("mapa");
  const [activeView, setActiveView] = useState("semestres");
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedDisc, setSelectedDisc] = useState(null);
  const isCoord = user?.email === COORDINATOR_EMAIL;

  const areas = [...new Set(disciplines.map(d=>d.area))];
  const semesters = [1,2,3,4,5,6,7,8];

  // ── Auth listener
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async u=>{
      setUser(u);
      if (u) {
        // Save/update user profile
        await setDoc(doc(db,"users",u.uid),{ uid:u.uid,name:u.displayName,email:u.email,photoURL:u.photoURL,lastLogin:new Date().toISOString() },{ merge:true });
        // Load progress — compatível com formato antigo (array) e novo (objeto com timestamps)
        const snap = await getDoc(doc(db,"progress",u.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.completed)) {
            // Formato antigo: migra automaticamente com timestamp de hoje
            const now = new Date().toISOString();
            const meta = {};
            data.completed.forEach(id => { meta[id] = { completedAt: now, semesterAtTime: disciplines.find(d=>d.id===id)?.semester || 0, migrated: true }; });
            setCompleted(new Set(data.completed));
            setCompletedMeta(meta);
            // Salva já no novo formato
            await setDoc(doc(db,"progress",u.uid), { completedMeta: meta, updatedAt: now }, { merge: true });
          } else if (data.completedMeta) {
            // Formato novo
            setCompleted(new Set(Object.keys(data.completedMeta)));
            setCompletedMeta(data.completedMeta);
          }
        }
        // Load experiences
        const expSnap = await getDocs(collection(db,"experiences"));
        const myExps = expSnap.docs.filter(d=>d.data().uid===u.uid).map(d=>({ id:d.id,...d.data() }));
        setExperiences(myExps);
        // Load vagas and candidaturas
        const vagasSnap = await getDocs(collection(db,"vagas"));
        setVagas(vagasSnap.docs.map(d=>({ id:d.id,...d.data() })));
        const candsSnap = await getDocs(collection(db,"candidaturas"));
        setCandidaturas(candsSnap.docs.map(d=>({ id:d.id,...d.data() })));
        // If coordinator, load all students
        if (u.email === COORDINATOR_EMAIL) {
          const usersSnap = await getDocs(collection(db,"users"));
          const progressSnap = await getDocs(collection(db,"progress"));
          const allExpsSnap = await getDocs(collection(db,"experiences"));
          const progressMap = {};
          progressSnap.docs.forEach(d=>{ progressMap[d.id]=d.data(); });
          const expCountMap = {};
          allExpsSnap.docs.forEach(d=>{ const uid=d.data().uid; expCountMap[uid]=(expCountMap[uid]||0)+1; });
          const students = usersSnap.docs
            .map(d=>d.data())
            .filter(s=>s.email !== COORDINATOR_EMAIL)
            .map(s=>{
              const prog = progressMap[s.uid];
              // Suporta formato antigo (array) e novo (completedMeta)
              let completedSet, meta;
              if (prog?.completedMeta) {
                meta = prog.completedMeta;
                completedSet = new Set(Object.keys(meta));
              } else {
                completedSet = new Set(prog?.completed||[]);
                meta = {};
              }
              const comps = getAutoCompetencies(completedSet);
              // Calcula ritmo: disciplinas concluídas por mês (últimos 60 dias)
              const now = Date.now();
              const recent = Object.values(meta).filter(m => m.completedAt && (now - new Date(m.completedAt).getTime()) < 60*24*60*60*1000).length;
              const lastActivity = Object.values(meta).reduce((latest, m) => {
                if (!m.completedAt) return latest;
                return !latest || m.completedAt > latest ? m.completedAt : latest;
              }, null);
              const daysSinceActivity = lastActivity ? Math.floor((now - new Date(lastActivity).getTime()) / (1000*60*60*24)) : null;
              return { ...s, completedCount:completedSet.size, progress:Math.round((completedSet.size/disciplines.length)*100), competencyCount:comps.length, experienceCount:expCountMap[s.uid]||0, recentActivity:recent, daysSinceActivity, lastActivity };
            });
          setAllStudents(students);
        }
      }
      setAuthLoading(false);
    });
    return unsub;
  },[]);

  const saveProgress = async (newSet, newMeta) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db,"progress",user.uid), {
        completedMeta: newMeta,
        updatedAt: new Date().toISOString()
      });
    } finally { setSaving(false); }
  };

  // ── Integração Estuda Aí ──────────────────────────────────────────────────
  const ESTUDAAI_URL = "https://ais-pre-hwmgrzo5yhw5krabhzuc4k-159345961516.us-east1.run.app/api/integration/mapa/sync";
  const ESTUDAAI_TOKEN = "Gbx123";

  const sendToEstudaAi = async (payload) => {
    try {
      await fetch(ESTUDAAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ESTUDAAI_TOKEN}`
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Estuda Aí sync falhou:", e);
    }
  };

  const detectMilestones = (discId, newSet, prevSet) => {
    const milestones = [];
    const disc = disciplines.find(d => d.id === discId);
    if (!disc) return milestones;

    // Marco 1: disciplina concluída
    if (newSet.has(discId) && !prevSet.has(discId)) {
      milestones.push({
        type: "discipline_completed",
        discipline_id: discId,
        discipline_name: disc.name,
        area: disc.area,
        semester: disc.semester,
        competencies: disc.competencies || []
      });
    }

    // Marco 2: semestre completo
    const semDiscs = disciplines.filter(d => d.semester === disc.semester);
    const semPrev = semDiscs.every(d => prevSet.has(d.id));
    const semNow  = semDiscs.every(d => newSet.has(d.id));
    if (semNow && !semPrev) {
      milestones.push({
        type: "semester_completed",
        semester: disc.semester,
        disciplines_count: semDiscs.length
      });
    }

    // Marco 3: trilha de carreira atingiu 25/50/75/100%
    careers.forEach(career => {
      if (!career.disciplines.includes(discId)) return;
      const total = career.disciplines.length;
      const prevPct = Math.floor((career.disciplines.filter(id => prevSet.has(id)).length / total) * 100);
      const nowPct  = Math.floor((career.disciplines.filter(id => newSet.has(id)).length  / total) * 100);
      [25, 50, 75, 100].forEach(threshold => {
        if (prevPct < threshold && nowPct >= threshold) {
          milestones.push({
            type: "career_milestone",
            career_id: career.id,
            career_name: career.name,
            threshold_pct: threshold,
            competencies: career.competencies
          });
        }
      });
    });

    return milestones;
  };

  const handleLogin = async ()=>{ setLoginLoading(true); try { await signInWithPopup(auth,googleProvider); } catch(e){console.error(e);} finally { setLoginLoading(false); } };
  const handleLogout = ()=>{ signOut(auth); setCompleted(new Set()); setExperiences([]); };

  const toggleCompleted = id => {
    const disc = disciplines.find(d => d.id === id);
    setCompleted(prev => {
      const n = new Set(prev);
      let newMeta = { ...completedMeta };
      if (n.has(id)) {
        n.delete(id);
        delete newMeta[id];
      } else {
        n.add(id);
        newMeta[id] = {
          completedAt: new Date().toISOString(),
          semesterAtTime: disc?.semester || 0
        };
        // Detecta marcos e envia para o Estuda Aí
        const milestones = detectMilestones(id, n, prev);
        if (milestones.length > 0) {
          sendToEstudaAi({
            student_uid: user.uid,
            student_name: user.displayName,
            student_email: user.email,
            timestamp: new Date().toISOString(),
            total_completed: n.size,
            total_disciplines: disciplines.length,
            progress_pct: Math.round((n.size / disciplines.length) * 100),
            milestones
          });
        }
      }
      setCompletedMeta(newMeta);
      saveProgress(n, newMeta);
      return n;
    });
  };

  const handleAddExperience = async (form)=>{
    const ref = await addDoc(collection(db,"experiences"),{ ...form,uid:user.uid,userName:user.displayName,createdAt:new Date().toISOString() });
    setExperiences(prev=>[...prev,{ id:ref.id,...form,uid:user.uid }]);
  };

  const handleDeleteExperience = async id=>{
    await deleteDoc(doc(db,"experiences",id));
    setExperiences(prev=>prev.filter(e=>e.id!==id));
  };

  const handleAddVaga = async (form) => {
    const ref = await addDoc(collection(db,"vagas"), { ...form, criadoPor: user.uid });
    setVagas(prev => [...prev, { id:ref.id, ...form }]);
  };

  const handleDeleteVaga = async (id) => {
    await deleteDoc(doc(db,"vagas",id));
    setVagas(prev => prev.filter(v => v.id !== id));
  };

  const handleCandidatar = async (vagaId) => {
    const ref = await addDoc(collection(db,"candidaturas"), { vagaId, uid:user.uid, userName:user.displayName, userEmail:user.email, photoURL:user.photoURL||"", candidatadoEm:new Date().toISOString() });
    setCandidaturas(prev => [...prev, { id:ref.id, vagaId, uid:user.uid }]);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}?portfolio=${user.uid}`;
    navigator.clipboard.writeText(url).then(()=>alert("Link copiado! Compartilhe com recrutadores ou coordenadores."));
  };

  const isUnlocked = disc=>disc.prereqs.every(p=>completed.has(p));
  const totalCH = disciplines.reduce((a,d)=>a+d.ch,0);
  const completedCH = disciplines.filter(d=>completed.has(d.id)).reduce((a,d)=>a+d.ch,0);
  const totalProgress = Math.round((completed.size/disciplines.length)*100);
  const getAreaProgress = area=>{ const d=disciplines.filter(x=>x.area===area); return { done:d.filter(x=>completed.has(x.id)).length,total:d.length }; };
  const getCareerProgress = career=>Math.round((career.disciplines.filter(id=>completed.has(id)).length/career.disciplines.length)*100);
  const getSemesterProgress = sem=>{ const d=disciplines.filter(x=>x.semester===sem); return { done:d.filter(x=>completed.has(x.id)).length,total:d.length }; };
  const recommendations = useMemo(()=>disciplines.filter(d=>!completed.has(d.id)&&isUnlocked(d)).slice(0,5),[completed]);
  const filteredDiscs = useMemo(()=>{
    if (activeView==="trilhas"&&selectedCareer){ const c=careers.find(x=>x.id===selectedCareer); return disciplines.filter(d=>c.disciplines.includes(d.id)); }
    if (activeView==="areas"&&selectedArea) return disciplines.filter(d=>d.area===selectedArea);
    return disciplines;
  },[activeView,selectedArea,selectedCareer]);
  const selectedDiscInfo = selectedDisc?disciplines.find(d=>d.id===selectedDisc):null;

  const navItems = [
    ["mapa",     "Mapa de Disciplinas",  Icon.Map],
    ["gap",      "Gap Analysis",         Icon.ChartBar],
    ["portfolio","Meu Portfólio",        Icon.Brain],
    ["vagas",    "Vagas",                Icon.Briefcase],
    ...(isCoord ? [["coord", "Coordenador", Icon.Users]] : []),
  ];

  if (authLoading) return <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif",color:"#9ca3af" }}>Carregando...</div>;
  if (!user) return <LoginScreen onLogin={handleLogin} loading={loginLoading}/>;

  return (
    <div style={{ fontFamily:"'DM Sans','Inter','Helvetica Neue',sans-serif", background:T.bg, minHeight:"100vh", color:T.text, display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
        ::-webkit-scrollbar-thumb:hover{background:#94a3b8}

        .disc-card{transition:all 0.18s ease;cursor:pointer}
        .disc-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,0.14)!important}
        .nav-item{transition:all 0.15s ease;cursor:pointer;border:none;background:none;width:100%;text-align:left;border-radius:10px}
        .nav-item:hover{background:rgba(99,102,241,0.07)}
        .nav-item.active{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff!important;box-shadow:0 4px 14px rgba(99,102,241,0.35)}
        .nav-item.active svg{color:#fff!important}
        .btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.18s ease;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,0.35)}
        .btn-ghost{background:#fff;color:#475569;border:1.5px solid #e2e8f0;border-radius:9px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s ease;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
        .btn-ghost:hover{border-color:#6366f1;color:#6366f1;background:#f5f3ff}
        .card{background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
        .badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:0.3px}
        .fade-in{animation:fadeIn 0.22s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .check-anim{transition:transform 0.15s ease}
        .check-anim:hover{transform:scale(1.2)}
        input,select,textarea{font-family:inherit;outline:none}
        input:focus,select:focus,textarea:focus{border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)}
        @media print{.no-print{display:none!important}}
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width:232, background:"#fff", borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0, boxShadow:"2px 0 12px rgba(0,0,0,0.04)" }}>
        {/* Logo */}
        <div style={{ padding:"20px 18px 16px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={UNIARA_LOGO_B64} alt="UNIARA" style={{ height:36, objectFit:"contain" }}/>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:T.text, lineHeight:1.2 }}>Mapa de</div>
              <div style={{ fontSize:12, fontWeight:700, color:T.primary, lineHeight:1.2 }}>Aprendizagem</div>
              <div style={{ fontSize:9, color:T.subtle, fontWeight:500, marginTop:1 }}>ADMINISTRAÇÃO · UNIARA</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          <div style={{ fontSize:9, fontWeight:700, color:T.subtle, letterSpacing:"0.8px", padding:"4px 10px 8px" }}>NAVEGAÇÃO</div>
          {navItems.map(([v, l, IconComp]) => (
            <button key={v} className={`nav-item${mainView===v?" active":""}`} onClick={()=>setMainView(v)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", marginBottom:3, color:mainView===v?"#fff":T.muted, fontSize:13, fontWeight:mainView===v?600:500 }}>
              <span style={{ color:mainView===v?"#fff":T.primary, flexShrink:0 }}><IconComp/></span>
              {l}
              {mainView===v && <span style={{ marginLeft:"auto" }}><Icon.Arrow/></span>}
            </button>
          ))}
        </nav>

        {/* Progress mini */}
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, background:"#fafafa" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:11, color:T.muted, fontWeight:500 }}>Progresso geral</span>
            <span style={{ fontSize:12, fontWeight:700, color:T.primary }}>{totalProgress}%</span>
          </div>
          <div style={{ height:6, background:"#e2e8f0", borderRadius:3, overflow:"hidden" }}>
            <div style={{ width:`${totalProgress}%`, height:"100%", background:T.grad1, borderRadius:3, transition:"width 0.6s ease" }}/>
          </div>
          <div style={{ fontSize:10, color:T.subtle, marginTop:5 }}>{completed.size} de {disciplines.length} disciplinas</div>
        </div>

        {/* User */}
        <div style={{ padding:"12px 14px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:9 }}>
          {user.photoURL
            ? <img src={user.photoURL} style={{ width:32, height:32, borderRadius:"50%", border:`2px solid ${T.border}` }} alt=""/>
            : <div style={{ width:32, height:32, borderRadius:"50%", background:T.grad1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>{user.displayName?.[0]||"?"}</div>
          }
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user.displayName?.split(" ")[0]}
              {isCoord && <span style={{ marginLeft:5, fontSize:9, background:T.grad1, color:"#fff", borderRadius:4, padding:"1px 6px" }}>COORD</span>}
            </div>
            <div style={{ fontSize:10, color:T.subtle, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} title="Sair" style={{ background:"none", border:"none", cursor:"pointer", color:T.subtle, padding:4, borderRadius:6, display:"flex", alignItems:"center" }} className="btn-ghost" onMouseEnter={e=>e.currentTarget.style.color=T.red} onMouseLeave={e=>e.currentTarget.style.color=T.subtle}>
            <Icon.Logout/>
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100vh", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ background:"#fff", borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:T.text }}>{navItems.find(([v])=>v===mainView)?.[1]||""}</div>
            <div style={{ fontSize:11, color:T.subtle }}>
              {mainView==="mapa" && `${completed.size} disciplinas concluídas · ${completedCH}h`}
              {mainView==="gap" && "Analise seu alinhamento com o mercado"}
              {mainView==="portfolio" && "Seu portfólio acadêmico e profissional"}
              {mainView==="vagas" && `${vagas.length} vaga${vagas.length!==1?"s":""} disponível${vagas.length!==1?"is":""}`}
              {mainView==="coord" && `${allStudents.length} aluno${allStudents.length!==1?"s":""} cadastrado${allStudents.length!==1?"s":""}`}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {saving && <span style={{ fontSize:11, color:T.subtle, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:T.amber, display:"inline-block", animation:"pulse 1s infinite" }}/>
              Salvando...
            </span>}
            <div style={{ background:`${T.primary}12`, borderRadius:8, padding:"4px 12px", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:11, fontWeight:700, color:T.primary }}>{completed.size}<span style={{ fontWeight:400, color:T.subtle }}>/{disciplines.length}</span></span>
              <span style={{ fontSize:10, color:T.subtle }}>discs.</span>
              <span style={{ width:1, height:12, background:T.border }}/>
              <span style={{ fontSize:11, fontWeight:700, color:T.cyan }}>{completedCH}<span style={{ fontWeight:400, color:T.subtle }}>h</span></span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:"auto" }}>

      {mainView==="vagas" && (
        <div style={{ height:"calc(100vh - 62px)", overflowY:"auto" }}>
          <VagasView user={user} completed={completed} isCoord={isCoord} vagas={vagas} onAddVaga={handleAddVaga} onDeleteVaga={handleDeleteVaga} onCandidatar={handleCandidatar} candidaturas={candidaturas}/>
        </div>
      )}
      {mainView==="portfolio" && (
        <div style={{ height:"calc(100vh - 62px)",overflowY:"auto" }}>
          <PortfolioView user={user} completed={completed} experiences={experiences} onAddExperience={handleAddExperience} onDeleteExperience={handleDeleteExperience} onShareLink={handleShareLink}/>
        </div>
      )}
      {mainView==="coord" && isCoord && (
        <div style={{ height:"calc(100vh - 62px)",overflowY:"auto" }}>
          <CoordDashboard allStudents={allStudents}/>
        </div>
      )}
      {mainView==="gap" && (
        <div style={{ height:"calc(100vh - 62px)",overflowY:"auto" }}>
          <GapAnalysis completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={id=>{setSelectedDisc(id);setMainView("mapa");}}/>
        </div>
      )}
      {mainView==="mapa" && (
        <div style={{ display:"flex",height:"calc(100vh - 62px)" }}>
          {/* SIDEBAR */}
          <div style={{ width:248,background:"#fff",borderRight:"1px solid #e5e7eb",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0 }}>
            <div style={{ padding:"12px 10px 0" }}>
              <div style={{ background:"#f3f4f6",borderRadius:8,padding:3,display:"flex",gap:2 }}>
                {[["semestres","Semestres"],["areas","Áreas"],["trilhas","Trilhas"]].map(([v,l])=>(
                  <button key={v} className="nav-btn" onClick={()=>{setActiveView(v);setSelectedArea(null);setSelectedCareer(null);}} style={{ flex:1,padding:"5px 0",borderRadius:6,background:activeView===v?"#fff":"transparent",boxShadow:activeView===v?"0 1px 3px rgba(0,0,0,0.1)":"none",fontSize:11,fontWeight:activeView===v?600:400,color:activeView===v?"#1a1a2e":"#6b7280" }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ flex:1,overflowY:"auto",padding:"8px 8px" }}>
              {activeView==="semestres" && semesters.map(s=>{const{done,total}=getSemesterProgress(s);const pct=Math.round((done/total)*100);return(
                <div key={s} style={{ padding:"7px 10px",borderRadius:7,marginBottom:2 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}><span style={{ fontSize:12,fontWeight:500,color:"#374151" }}>{s}º Semestre</span><span style={{ fontSize:10,color:pct===100?"#047857":"#6b7280",fontWeight:pct===100?600:400 }}>{pct===100?"✓ ok":`${done}/${total}`}</span></div>
                  <div style={{ width:"100%",height:3,background:"#e5e7eb",borderRadius:2,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:pct===100?"#047857":"#1d4ed8",borderRadius:2 }}/></div>
                </div>
              );})}
              {activeView==="areas" && areas.map(area=>{const{done,total}=getAreaProgress(area);const pct=Math.round((done/total)*100);const color=areaColors[area];return(
                <button key={area} className="sidebar-btn" onClick={()=>setSelectedArea(selectedArea===area?null:area)} style={{ padding:"8px 10px",borderRadius:7,background:selectedArea===area?`${color}10`:"transparent",marginBottom:2,border:selectedArea===area?`1px solid ${color}22`:"1px solid transparent" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:7,height:7,borderRadius:2,background:color,flexShrink:0 }}/><span style={{ fontSize:11,fontWeight:selectedArea===area?600:400,color:selectedArea===area?color:"#374151" }}>{area}</span></div><span style={{ fontSize:10,color:"#9ca3af" }}>{pct}%</span></div>
                  <div style={{ width:"100%",height:2,background:"#e5e7eb",borderRadius:2,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:color }}/></div>
                </button>
              );})}
              {activeView==="trilhas" && careers.map(career=>{const pct=getCareerProgress(career);return(
                <button key={career.id} className="sidebar-btn" onClick={()=>setSelectedCareer(selectedCareer===career.id?null:career.id)} style={{ padding:"10px 10px",borderRadius:7,background:selectedCareer===career.id?`${career.color}10`:"transparent",marginBottom:3,border:selectedCareer===career.id?`1px solid ${career.color}22`:"1px solid transparent" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5 }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ fontSize:13 }}>{career.icon}</span><span style={{ fontSize:12,fontWeight:selectedCareer===career.id?600:400,color:selectedCareer===career.id?career.color:"#374151" }}>{career.name}</span></div><span style={{ fontSize:11,fontWeight:700,color:career.color }}>{pct}%</span></div>
                  <div style={{ width:"100%",height:3,background:"#e5e7eb",borderRadius:2,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:career.color }}/></div>
                </button>
              );})}
            </div>
            <div style={{ borderTop:"1px solid #e5e7eb",padding:"10px 12px 12px" }}>
              <div style={{ fontSize:10,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px",marginBottom:8 }}>PRÓXIMOS PASSOS</div>
              {recommendations.length===0?<div style={{ fontSize:12,color:"#047857",fontWeight:500 }}>Parabéns! Tudo concluído 🎉</div>:recommendations.map(d=>(
                <div key={d.id} onClick={()=>setSelectedDisc(d.id)} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:6,cursor:"pointer" }}>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:areaColors[d.area],flexShrink:0,marginTop:5 }}/>
                  <span style={{ fontSize:11,color:"#374151",lineHeight:1.4 }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex:1,overflowY:"auto",padding:"18px 22px" }}>
            {activeView==="semestres"?semesters.map(sem=>{
              const semDiscs=disciplines.filter(d=>d.semester===sem);
              const{done,total}=getSemesterProgress(sem);
              return(
                <div key={sem} className="fade-in" style={{ marginBottom:26 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                    <div style={{ background:done===total?"#dcfce7":"#eff6ff",borderRadius:6,padding:"2px 10px" }}><span style={{ fontSize:12,fontWeight:700,color:done===total?"#047857":"#1d4ed8" }}>{sem}º Semestre</span></div>
                    <span style={{ fontSize:11,color:"#9ca3af" }}>{done}/{total} disciplinas · {semDiscs.reduce((a,d)=>a+d.ch,0)}h</span>
                    {done===total&&<span style={{ fontSize:11,color:"#047857",fontWeight:600 }}>✓ Concluído</span>}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:8 }}>
                    {semDiscs.map(disc=><DiscCard key={disc.id} disc={disc} completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={setSelectedDisc} selectedDisc={selectedDisc}/>)}
                  </div>
                </div>
              );
            }):(
              <div>
                <div style={{ marginBottom:16 }}>
                  <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:"#1a1a2e" }}>{activeView==="trilhas"&&selectedCareer?careers.find(c=>c.id===selectedCareer)?.name:activeView==="areas"&&selectedArea?selectedArea:"← Selecione no painel lateral"}</h2>
                  {(selectedArea||selectedCareer)&&<p style={{ fontSize:12,color:"#6b7280",marginTop:2 }}>{filteredDiscs.length} disciplinas · {filteredDiscs.filter(d=>completed.has(d.id)).length} concluídas</p>}
                </div>
                {(selectedArea||selectedCareer)&&<div className="fade-in" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:8 }}>{filteredDiscs.sort((a,b)=>a.semester-b.semester).map(disc=><DiscCard key={disc.id} disc={disc} completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={setSelectedDisc} selectedDisc={selectedDisc}/>)}</div>}
              </div>
            )}
          </div>

          {/* DETAIL PANEL */}
          {selectedDiscInfo && (
            <div style={{ width:268, background:"#fff", borderLeft:`1px solid ${T.border}`, padding:18, overflowY:"auto", flexShrink:0 }} className="fade-in">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:T.grad1, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                  <Icon.Academic/>
                </div>
                <button onClick={()=>setSelectedDisc(null)} style={{ width:28, height:28, borderRadius:7, background:T.bg, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:T.muted }}>
                  <Icon.X/>
                </button>
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:areaColors[selectedDiscInfo.area], letterSpacing:"0.5px", marginBottom:4 }}>{selectedDiscInfo.area.toUpperCase()}</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:15, fontWeight:400, color:T.text, lineHeight:1.4, marginBottom:14 }}>{selectedDiscInfo.name}</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14 }}>
                {[["Semestre",`${selectedDiscInfo.semester}º`],["C.H.",selectedDiscInfo.ch>0?`${selectedDiscInfo.ch}h`:"—"],["Status",completed.has(selectedDiscInfo.id)?"✓ Concluída":isUnlocked(selectedDiscInfo)?"Disponível":"Bloqueada"],["Pré-reqs",selectedDiscInfo.prereqs.length||"Nenhum"]].map(([l,v])=>(
                  <div key={l} style={{ background:T.bg, borderRadius:8, padding:"7px 9px" }}>
                    <div style={{ fontSize:9, color:T.subtle, marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{v}</div>
                  </div>
                ))}
              </div>
              {selectedDiscInfo.competencies?.length>0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:T.subtle, letterSpacing:"0.4px", marginBottom:7 }}>COMPETÊNCIAS</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {selectedDiscInfo.competencies.map(c=>(
                      <span key={c} style={{ fontSize:10, padding:"3px 8px", background:`${T.primary}12`, color:T.primary, borderRadius:5, fontWeight:500 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedDiscInfo.prereqs.length>0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:T.subtle, letterSpacing:"0.4px", marginBottom:7 }}>PRÉ-REQUISITOS</div>
                  {selectedDiscInfo.prereqs.map(rId=>{const r=disciplines.find(d=>d.id===rId);const done=completed.has(rId);return(
                    <div key={rId} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, cursor:"pointer", padding:"4px 6px", borderRadius:6 }} onClick={()=>setSelectedDisc(rId)}>
                      <div style={{ width:16, height:16, borderRadius:4, background:done?T.primary:T.border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff" }}>{done&&<Icon.Check/>}</div>
                      <span style={{ fontSize:11, color:done?T.text:T.subtle }}>{r?.name}</span>
                    </div>
                  );})}
                </div>
              )}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:T.subtle, letterSpacing:"0.4px", marginBottom:7 }}>TRILHAS RELACIONADAS</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {careers.filter(c=>c.disciplines.includes(selectedDiscInfo.id)).map(c=>(
                    <span key={c.id} style={{ fontSize:10, padding:"3px 9px", background:`${c.color}12`, color:c.color, borderRadius:5, fontWeight:600, cursor:"pointer" }} onClick={()=>setMainView("gap")}>{c.icon} {c.name}</span>
                  ))}
                  {careers.filter(c=>c.disciplines.includes(selectedDiscInfo.id)).length===0 && <span style={{ fontSize:11, color:T.subtle }}>Base geral</span>}
                </div>
              </div>
              <button onClick={()=>{if(isUnlocked(selectedDiscInfo)||completed.has(selectedDiscInfo.id))toggleCompleted(selectedDiscInfo.id);}}
                disabled={!isUnlocked(selectedDiscInfo)&&!completed.has(selectedDiscInfo.id)}
                style={{ width:"100%", padding:"9px", borderRadius:8, border:"none", fontSize:12, fontWeight:600,
                  cursor:isUnlocked(selectedDiscInfo)||completed.has(selectedDiscInfo.id)?"pointer":"not-allowed",
                  background:completed.has(selectedDiscInfo.id)?T.bg:isUnlocked(selectedDiscInfo)?T.grad1:T.bg,
                  color:completed.has(selectedDiscInfo.id)?T.muted:isUnlocked(selectedDiscInfo)?"#fff":T.subtle,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"inherit" }}>
                {completed.has(selectedDiscInfo.id) ? "Desmarcar disciplina" : isUnlocked(selectedDiscInfo) ? <><Icon.Check/> Marcar como concluída</> : <><Icon.Lock/> Bloqueada</>}
              </button>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
