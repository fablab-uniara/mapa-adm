const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const DISCIPLINES = [
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
  { id:"ativ-comp",name:"Atividades Complementares",area:"Integração",semester:8,ch:0,prereqs:[],competencies:["Desenvolvimento Pessoal","Visão Ampliada"] }
];

const CAREERS = [
  { id:"financeiro",name:"Gestor Financeiro",icon:"📈",color:"#1d4ed8",description:"Responsável pela saúde financeira da empresa: fluxo de caixa, investimentos, análise de balanços e planejamento orçamentário.",disciplines:["mat-adm","mat-fin1","mat-fin2","cont1","cont2","adm-fin1","adm-fin2","anal-eco-fin","fin-orc1","fin-orc2","cont-custos1","cont-custos2","controladoria","gestao-cont"],competencies:["Análise Financeira","Contabilidade","Matemática Financeira","Planej. Orçamentário","Controladoria"],compWeights:[5,4,4,3,3],marketDemand:"Alta",avgSalary:"R$ 6.000 – R$ 12.000",topSkills:["Excel Avançado","Power BI","SAP/ERP","Valuation","IFRS"] },
  { id:"marketing",name:"Analista de Marketing",icon:"🎯",color:"#7c3aed",description:"Desenvolve estratégias de marca, comunicação e crescimento. Atua com dados, comportamento do consumidor e marketing digital.",disciplines:["fund-mkt","gest-mkt","dec-prod-preco","tend-mkt1","tend-mkt2","comp-hum-org","estat1","estat2"],competencies:["Marketing Digital","Comportamento do Cons.","Análise de Dados","Branding","Gestão de Produtos"],compWeights:[5,4,4,3,3],marketDemand:"Muito Alta",avgSalary:"R$ 4.500 – R$ 9.000",topSkills:["Google Analytics","Meta Ads","CRM","SEO/SEM","Copywriting"] },
  { id:"rh",name:"Especialista em RH",icon:"👥",color:"#047857",description:"Cuida do capital humano: recrutamento, desenvolvimento, cultura organizacional e gestão de performance.",disciplines:["psi-adm","comp-hum-org","form-lid","din-rel-inter","gest-pessoas1","gest-pessoas2","etica-crit"],competencies:["Gestão de Talentos","Liderança & Cultura","Psicologia Org.","Legislação Trab.","T&D"],compWeights:[5,4,4,3,3],marketDemand:"Média",avgSalary:"R$ 4.000 – R$ 8.000",topSkills:["People Analytics","HRIS/HCM","Entrevista por Comp.","OKRs","D&I"] },
  { id:"empreendedor",name:"Empreendedor",icon:"🚀",color:"#b45309",description:"Cria e escala negócios, seja como fundador de startup ou intraempreendedor dentro de grandes organizações.",disciplines:["cult-comp-emp","emp-startups","plano-neg1","plano-neg2","novos-modelos","gest-inov-emp","neg-disr","dir-empre-inov","adm-fin1"],competencies:["Modelagem de Negócios","Inovação & Produto","Finanças Básicas","Liderança","Vendas & Growth"],compWeights:[5,5,3,3,4],marketDemand:"Alta",avgSalary:"Variável",topSkills:["Lean Startup","Design Thinking","Pitch","Growth Hacking","Product Mgmt"] },
  { id:"operacoes",name:"Gestor de Operações",icon:"⚙️",color:"#dc2626",description:"Otimiza processos produtivos e cadeia de suprimentos para garantir eficiência, qualidade e redução de custos.",disciplines:["adm-rec-pat1","adm-rec-pat2","adm-prod","gest-qualidade","logist1","logist2","pesq-oper1","pesq-oper2"],competencies:["Supply Chain","Gestão da Qualidade","Pesquisa Operacional","Lean / Six Sigma","KPIs Operacionais"],compWeights:[5,4,4,4,3],marketDemand:"Alta",avgSalary:"R$ 5.500 – R$ 11.000",topSkills:["Lean Manufacturing","Six Sigma","ERP/SAP","Gestão de Projetos","Power BI"] },
  { id:"estrategia",name:"Consultor Estratégico",icon:"🔍",color:"#0891b2",description:"Analisa cenários e propõe soluções para desafios complexos de negócio, atuando em consultorias ou áreas de estratégia corporativa.",disciplines:["mod-decisao","teoria-org1","teoria-org2","plan-estrat","elab-proj1","elab-proj2","papel-adm-4rev","pesq-oper1"],competencies:["Análise Estratégica","Gestão de Projetos","Raciocínio Analítico","Comunicação Exec.","Modelagem de Cenários"],compWeights:[5,4,5,4,3],marketDemand:"Muito Alta",avgSalary:"R$ 8.000 – R$ 18.000",topSkills:["Frameworks Estratégicos","Excel/PPT Avançado","Python/SQL básico","Storytelling","Stakeholders"] }
];

const AREAS = [
  { name: "Formação Básica", color: "#64748b" },
  { name: "Finanças e Contabilidade", color: "#1d4ed8" },
  { name: "Marketing", color: "#7c3aed" },
  { name: "Gestão de Pessoas", color: "#047857" },
  { name: "Estratégia", color: "#b45309" },
  { name: "Operações", color: "#dc2626" },
  { name: "Economia", color: "#0891b2" },
  { name: "Empreendedorismo", color: "#d97706" },
  { name: "Tecnologia e Inovação", color: "#6d28d9" },
  { name: "Direito e Legislação", color: "#374151" },
  { name: "Integração", color: "#9333ea" }
];

const COURSE = {
  name: "Administração",
  code: "ADM",
  totalSemesters: 8,
  coordinatorEmail: "gbraz@uniara.edu.br",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  active: true,
  createdAt: new Date().toISOString()
};

async function migrate() {
  console.log("🚀 Iniciando migração...");

  if (DISCIPLINES.length === 0 || DISCIPLINES[0].id === undefined) {
    console.error("❌ ERRO: Array DISCIPLINES vazio.");
    process.exit(1);
  }
  if (CAREERS.length === 0 || CAREERS[0].id === undefined) {
    console.error("❌ ERRO: Array CAREERS vazio.");
    process.exit(1);
  }

  await db.collection("courses").doc("ADM").set(COURSE);
  console.log("✅ Curso criado");

  for (const area of AREAS) {
    await db.collection("courses").doc("ADM").collection("areas").doc(area.name).set(area);
  }
  console.log("✅ " + AREAS.length + " áreas criadas");

  for (const d of DISCIPLINES) {
    await db.collection("courses").doc("ADM").collection("disciplinas").doc(d.id).set(d);
  }
  console.log("✅ " + DISCIPLINES.length + " disciplinas criadas");

  for (const c of CAREERS) {
    await db.collection("courses").doc("ADM").collection("careers").doc(c.id).set(c);
  }
  console.log("✅ " + CAREERS.length + " carreiras criadas");

  console.log("\n🎉 Migração concluída!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("❌ Erro:", err);
  process.exit(1);
});