import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useRef } from 'react';
import { db } from '../App'; 
import { doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';

export default function GestaoCursoView({ cursoId, disciplines, careers = [], isCoord }) {
  const [activeTab, setActiveTab] = useState("disciplinas"); 
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Referência para o input de arquivo oculto
  
  // ── ESTADOS: DISCIPLINAS ──
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    id: "", name: "", area: "Formação Básica", semester: 1, ch: 50, prereqs: "", competencies: "" 
  });

  // ── ESTADOS: TRILHAS ──
  const [showTrilhaForm, setShowTrilhaForm] = useState(false);
  const [trilhaForm, setTrilhaForm] = useState({
    id: "", name: "", icon: "🎯", color: "#1d4ed8", description: "", marketDemand: "Alta", avgSalary: "", topSkills: "", competencies: "", compWeights: "", disciplines: []
  });

  // ── ESTADOS: CONFIGS ──
  const [configForm, setConfigForm] = useState({ 
    name: "Administração", coordinatorEmail: "gbraz@uniara.edu.br" 
  });

  const AREAS = ["Formação Básica", "Tecnologia e Inovação", "Gestão de Pessoas", "Marketing", "Finanças e Contabilidade", "Operações", "Estratégia", "Economia", "Empreendedorismo", "Direito e Legislação", "Integração"];

  // ==========================================
  // FUNÇÕES DE DISCIPLINAS E IMPORTAÇÃO
  // ==========================================
  
  // Função para processar o arquivo JSON
  // Função para processar o arquivo JSON (Atualizada para o formato Gera PPC)
  const handleImportJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoading(true);
        const data = JSON.parse(event.target.result);
        
        let disciplinasArray = [];

        // Verifica se é o formato do Sipe/Gera PPC (com a chave disciplinas_ppc)
        if (data && data.disciplinas_ppc) {
          Object.entries(data.disciplinas_ppc).forEach(([semesterStr, disciplinasObj]) => {
            // Extrai o número do semestre (ex: "4º Semestre" -> 4)
            const semesterMatch = semesterStr.match(/\d+/);
            const semesterNumber = semesterMatch ? parseInt(semesterMatch[0], 10) : 1;

            Object.entries(disciplinasObj).forEach(([discName, discDetails]) => {
              // Cria um ID seguro para o banco (minúsculo, sem acentos ou caracteres especiais)
              const safeId = discName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

              disciplinasArray.push({
                id: safeId,
                name: discName,
                area: "Formação Básica", // Área padrão (o coordenador ajusta depois se quiser colorir o mapa)
                semester: semesterNumber,
                ch: 60, // Carga horária padrão caso não venha no JSON
                prereqs: [],
                competencies: []
              });
            });
          });
        } else if (Array.isArray(data)) {
          // Mantém compatibilidade com o formato de array simples antigo
          disciplinasArray = data;
        } else {
          throw new Error("Formato de arquivo não reconhecido.");
        }

        if (disciplinasArray.length === 0) {
          throw new Error("Nenhuma disciplina encontrada no arquivo.");
        }

        const batch = writeBatch(db);

        disciplinasArray.forEach(disc => {
          const docRef = doc(db, `courses/${cursoId}/disciplinas`, disc.id);
          
          batch.set(docRef, {
            id: disc.id,
            name: disc.name,
            area: disc.area,
            semester: disc.semester,
            ch: disc.ch,
            prereqs: disc.prereqs,
            competencies: disc.competencies
          });
        });

        await batch.commit();
        alert(`🚀 Sucesso! ${disciplinasArray.length} disciplinas foram importadas do Gera PPC para a grade.`);
        e.target.value = null; // Reseta o input para permitir subir o mesmo arquivo de novo se necessário
        
      } catch (error) {
        console.error("Erro na importação:", error);
        alert("Erro ao ler o arquivo. Certifique-se de que é um JSON válido exportado do Sipe/Gera PPC.");
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleEdit = (disc) => {
    setForm({
      id: disc.id, name: disc.name, area: disc.area, semester: disc.semester, ch: disc.ch,
      prereqs: disc.prereqs.join(", "), competencies: disc.competencies?.join(", ") || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (discId, discName) => {
    if (window.confirm(`Tem certeza que deseja DELETAR a disciplina "${discName}"?`)) {
      try {
        await deleteDoc(doc(db, `courses/${cursoId}/disciplinas`, discId));
        alert("Disciplina excluída com sucesso!");
      } catch (error) { alert("Erro ao excluir."); }
    }
  };

  const handleSubmit = async () => {
    if (!form.id || !form.name) return alert("Preencha o ID e o Nome da disciplina.");
    setLoading(true);
    try {
      const formatArray = (str) => str.split(",").map(i => i.trim()).filter(i => i);
      const novaDisciplina = {
        id: form.id, name: form.name, area: form.area, semester: Number(form.semester), ch: Number(form.ch),
        prereqs: formatArray(form.prereqs), competencies: formatArray(form.competencies)
      };
      await setDoc(doc(db, `courses/${cursoId}/disciplinas`, form.id), novaDisciplina);
      alert("Disciplina salva com sucesso!");
      setForm({ id: "", name: "", area: "Formação Básica", semester: 1, ch: 50, prereqs: "", competencies: "" });
      setShowForm(false);
    } catch (error) { alert("Erro ao salvar."); } 
    setLoading(false);
  };

  // ==========================================
  // FUNÇÕES DE TRILHAS
  // ==========================================
  const handleEditTrilha = (t) => {
    setTrilhaForm({
      id: t.id, name: t.name, icon: t.icon, color: t.color, description: t.description, marketDemand: t.marketDemand, avgSalary: t.avgSalary,
      topSkills: t.topSkills?.join(", ") || "",
      competencies: t.competencies?.join(", ") || "",
      compWeights: t.compWeights?.join(",") || "",
      disciplines: t.disciplines || []
    });
    setShowTrilhaForm(true);
  };

  const handleDeleteTrilha = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja DELETAR a trilha "${name}"?`)) {
      await deleteDoc(doc(db, `courses/${cursoId}/careers`, id));
      alert("Trilha excluída!");
    }
  };

  const handleSubmitTrilha = async () => {
    if (!trilhaForm.id || !trilhaForm.name) return alert("Preencha ID e Nome da Trilha.");
    setLoading(true);
    try {
      const novaTrilha = {
        ...trilhaForm,
        topSkills: trilhaForm.topSkills.split(",").map(i => i.trim()).filter(Boolean),
        competencies: trilhaForm.competencies.split(",").map(i => i.trim()).filter(Boolean),
        compWeights: trilhaForm.compWeights.split(",").map(i => Number(i.trim())).filter(Boolean)
      };
      await setDoc(doc(db, `courses/${cursoId}/careers`, trilhaForm.id), novaTrilha);
      alert("Trilha salva com sucesso!");
      setShowTrilhaForm(false);
    } catch (e) { alert("Erro ao salvar trilha."); }
    setLoading(false);
  };
const handleSugerirTrilhasIA = async () => {
    setLoading(true);
    try {
      // 1. Inicializa o Gemini com sua chave (use a variável de ambiente)
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // 2. Monta o prompt com os dados que o App.jsx enviou
      const prompt = `
        Você é um especialista em currículos acadêmicos. 
        Com base no Perfil do Egresso: "${perfilEgresso}" 
        e na lista de disciplinas: ${disciplines.map(d => d.name).join(", ")}, 
        gere 3 trilhas de carreira. 
        
        Responda APENAS com um array JSON válido, sem texto explicativo: 
        [
          {
            "id": "trilha-id", 
            "name": "Nome da Trilha", 
            "icon": "🎯", 
            "color": "#1d4ed8", 
            "description": "Breve descrição", 
            "marketDemand": "Alta", 
            "avgSalary": "R$ 0.000", 
            "topSkills": ["Skill1"], 
            "competencies": ["Comp1"], 
            "compWeights": [5,4,4,3,3], 
            "disciplines": ["id-de-uma-disciplina"]
          }
        ]
      `;

      // 3. Chama a IA
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // 4. Limpa e converte para objeto
      const jsonString = responseText.replace(/```json|```/g, "").trim();
      const sugestoes = JSON.parse(jsonString);

      // 5. Salva no Firebase
      const batch = writeBatch(db);
      sugestoes.forEach(trilha => {
        batch.set(doc(db, `courses/${cursoId}/careers`, trilha.id), trilha);
      });
      
      await batch.commit();
      alert("✨ Trilhas geradas e aplicadas com sucesso!");
      
    } catch (err) {
      console.error("Erro Gemini:", err);
      alert("Erro ao processar IA. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };
  const toggleDiscInTrilha = (dId) => {
    setTrilhaForm(prev => {
      const has = prev.disciplines.includes(dId);
      return { ...prev, disciplines: has ? prev.disciplines.filter(id => id !== dId) : [...prev.disciplines, dId] };
    });
  };

  // ==========================================
  // FUNÇÕES DE CONFIGS
  // ==========================================
  const handleSaveConfigs = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "courses", cursoId), { name: configForm.name, coordinatorEmail: configForm.coordinatorEmail });
      alert("Configurações do curso atualizadas!");
    } catch(e) { alert("Erro ao atualizar o curso. Verifique as permissões."); }
    setLoading(false);
  };

  if (!isCoord) return <div style={{ padding: 24 }}>Acesso restrito a coordenadores.</div>;

  return (
    <div className="fade-in" style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}>
      {/* ── CABEÇALHO E ABAS ── */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, color: "#1a1a2e" }}>
          Gestão do Curso ({cursoId})
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Administre a matriz curricular, trilhas de carreira e configurações gerais.</p>

        <div style={{ display: "flex", gap: 8, marginTop: 18, borderBottom: "1px solid #e5e7eb", paddingBottom: 10 }}>
          <button onClick={() => setActiveTab("disciplinas")} style={{ padding: "8px 16px", borderRadius: 8, background: activeTab === "disciplinas" ? "#1d4ed8" : "transparent", color: activeTab === "disciplinas" ? "#fff" : "#6b7280", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>📚 Disciplinas</button>
          <button onClick={() => setActiveTab("trilhas")} style={{ padding: "8px 16px", borderRadius: 8, background: activeTab === "trilhas" ? "#1d4ed8" : "transparent", color: activeTab === "trilhas" ? "#fff" : "#6b7280", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🎯 Trilhas de Carreira</button>
          <button onClick={() => setActiveTab("configs")} style={{ padding: "8px 16px", borderRadius: 8, background: activeTab === "configs" ? "#1d4ed8" : "transparent", color: activeTab === "configs" ? "#fff" : "#6b7280", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⚙️ Configurações</button>
        </div>
      </div>

      {/* ── ABA: DISCIPLINAS ── */}
      {activeTab === "disciplinas" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>Matriz Curricular</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {/* Input de arquivo invisível */}
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleImportJSON} 
                style={{ display: "none" }} 
              />
              <button onClick={() => fileInputRef.current.click()} disabled={loading} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>
                {loading ? "Importando..." : "📥 Importar JSON do Sipe"}
              </button>
              <button onClick={() => { setForm({ id: "", name: "", area: "Formação Básica", semester: 1, ch: 50, prereqs: "", competencies: "" }); setShowForm(!showForm); }} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {showForm ? "Cancelar" : "+ Nova Disciplina"}
              </button>
            </div>
          </div>

          {showForm && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #10b981", padding: 20, marginBottom: 20, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 14 }}>{form.id ? "Editar Disciplina" : "Cadastrar Nova Disciplina"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>CÓDIGO (ID único)</label><input value={form.id} disabled={!!form.name && form.id !== ""} onChange={e => setForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4, background: form.name && form.id !== "" ? "#f3f4f6" : "#fff" }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>NOME DA DISCIPLINA</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>ÁREA DE CONHECIMENTO</label><select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4, background: "#fff" }}>{AREAS.map(a => <option key={a}>{a}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 2fr", gap: 10, marginBottom: 14 }}>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>SEMESTRE</label><input type="number" min="1" max="10" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>CARGA HORÁRIA</label><input type="number" value={form.ch} onChange={e => setForm(f => ({ ...f, ch: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>PRÉ-REQUISITOS (IDs sep. vírgula)</label><input value={form.prereqs} onChange={e => setForm(f => ({ ...f, prereqs: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>COMPETÊNCIAS (sep. vírgula)</label><input value={form.competencies} onChange={e => setForm(f => ({ ...f, competencies: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSubmit} disabled={loading} style={{ padding: "9px 24px", borderRadius: 7, border: "none", background: "#10b981", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>{loading ? "Salvando..." : "Salvar Disciplina"}</button>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, color: "#6b7280", cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18 }}>
            <div style={{ display: "grid", gap: 8 }}>
              {disciplines.sort((a,b) => a.semester - b.semester).map(d => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 10, color: "#fff", background: "#1d4ed8", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>{d.semester}º SEM</span><span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{d.name}</span></div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}><strong>ID:</strong> {d.id} | <strong>Área:</strong> {d.area} | <strong>CH:</strong> {d.ch}h | <strong>Pré-reqs:</strong> {d.prereqs.length ? d.prereqs.join(", ") : "Nenhum"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleEdit(d)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>✏️ Editar</button>
                    <button onClick={() => handleDelete(d.id, d.name)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}>🗑️ Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    {/* ── ABA: TRILHAS DE CARREIRA ── */}
      {activeTab === "trilhas" && (
        <div className="fade-in">
          {/* BOTÃO DA IA POSICIONADO CORRETAMENTE */}
          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px dashed #7c3aed", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24 }}>✨</div>
              <div>
                <h3 style={{ fontSize: 14, color: "#1a1a2e" }}>IA de Planejamento Estratégico</h3>
                <p style={{ fontSize: 11, color: "#6b7280" }}>Use o Perfil do Egresso e os objetivos do curso para sugerir trilhas automaticamente.</p>
              </div>
              // Localize este botão na Aba Trilhas:
<button 
  onClick={handleSugerirTrilhasIA} // <-- Troque o alert por isso
  disabled={loading}
  style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>
  {loading ? "Processando..." : "✨ Sugerir Trilhas com IA"}
</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>Trilhas Profissionais</h2>
            <button onClick={() => { setTrilhaForm({ id: "", name: "", icon: "🎯", color: "#1d4ed8", description: "", marketDemand: "Alta", avgSalary: "", topSkills: "", competencies: "", compWeights: "", disciplines: [] }); setShowTrilhaForm(!showTrilhaForm); }} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {showTrilhaForm ? "Cancelar" : "+ Nova Trilha"}
            </button>
          </div>

          {showTrilhaForm && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #7c3aed", padding: 20, marginBottom: 20, boxShadow: "0 4px 12px rgba(124, 58, 237, 0.1)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 14 }}>{trilhaForm.id ? "Editar Trilha" : "Cadastrar Nova Trilha"}</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 80px 80px", gap: 10, marginBottom: 10 }}>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>ID (único)</label><input value={trilhaForm.id} disabled={!!trilhaForm.name && trilhaForm.id !== ""} onChange={e => setTrilhaForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4, background: trilhaForm.name && trilhaForm.id !== "" ? "#f3f4f6" : "#fff" }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>NOME DA TRILHA</label><input value={trilhaForm.name} onChange={e => setTrilhaForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>ÍCONE</label><input value={trilhaForm.icon} onChange={e => setTrilhaForm(f => ({ ...f, icon: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4, textAlign: "center" }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>COR HEX</label><input type="color" value={trilhaForm.color} onChange={e => setTrilhaForm(f => ({ ...f, color: e.target.value }))} style={{ width: "100%", height: 34, padding: "0", border: "none", marginTop: 4, cursor:"pointer" }} /></div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>DESCRIÇÃO</label>
                <textarea value={trilhaForm.description} onChange={e => setTrilhaForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4, resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 10, marginBottom: 14 }}>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>DEMANDA MERCADO</label><select value={trilhaForm.marketDemand} onChange={e => setTrilhaForm(f => ({ ...f, marketDemand: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4, background: "#fff" }}><option>Muito Alta</option><option>Alta</option><option>Média</option><option>Baixa</option></select></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>SALÁRIO MÉDIO</label><input placeholder="R$ 4.000 - R$ 8.000" value={trilhaForm.avgSalary} onChange={e => setTrilhaForm(f => ({ ...f, avgSalary: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>HARD SKILLS (sep. vírgula)</label><input placeholder="Excel, Power BI, Python" value={trilhaForm.topSkills} onChange={e => setTrilhaForm(f => ({ ...f, topSkills: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14, background:"#f9fafb", padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>RADAR: 5 COMPETÊNCIAS-CHAVE</label><input placeholder="Ex: Liderança, Finanças, Excel, Dados, Inovação" value={trilhaForm.competencies} onChange={e => setTrilhaForm(f => ({ ...f, competencies: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>RADAR: 5 PESOS (1 a 5)</label><input placeholder="Ex: 5,4,4,3,3" value={trilhaForm.compWeights} onChange={e => setTrilhaForm(f => ({ ...f, compWeights: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 12, marginTop: 4 }} /></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 700 }}>📚 Disciplinas que compõem esta trilha ({trilhaForm.disciplines.length} selecionadas)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, maxHeight: 200, overflowY: 'auto', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, marginTop: 6, background: "#fff" }}>
                  {disciplines.sort((a,b)=>a.semester-b.semester).map(d => (
                      <label key={d.id} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: "pointer", background: trilhaForm.disciplines.includes(d.id) ? "#eff6ff" : "transparent", padding: "4px 6px", borderRadius: 4 }}>
                        <input type="checkbox" checked={trilhaForm.disciplines.includes(d.id)} onChange={() => toggleDiscInTrilha(d.id)} />
                        {d.semester}º - {d.name}
                      </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSubmitTrilha} disabled={loading} style={{ padding: "9px 24px", borderRadius: 7, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>{loading ? "Salvando..." : "Salvar Trilha"}</button>
                <button onClick={() => setShowTrilhaForm(false)} style={{ padding: "9px 18px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, color: "#6b7280", cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {careers.map(c => (
              <div key={c.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${c.color}30`, padding: 16, borderTop: `4px solid ${c.color}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 24 }}>{c.icon}</span><span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{c.name}</span></div>
                </div>
                <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 12, height: 34, overflow: "hidden" }}>{c.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb", padding: "8px 10px", borderRadius: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>📚 {c.disciplines.length} Disciplinas</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981" }}>💰 {c.avgSalary}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => handleEditTrilha(c)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>✏️ Editar</button>
                  <button onClick={() => handleDeleteTrilha(c.id, c.name)} style={{ padding: "6px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}>🗑️ Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABA: CONFIGURAÇÕES ── */}
      {activeTab === "configs" && (
        <div className="fade-in">
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, maxWidth: 600 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>Configurações Gerais do Curso</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>NOME OFICIAL DO CURSO</label>
                <input value={configForm.name} onChange={e => setConfigForm({...configForm, name: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>E-MAIL DA COORDENAÇÃO (Suporte)</label>
                <input value={configForm.coordinatorEmail} onChange={e => setConfigForm({...configForm, coordinatorEmail: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13, marginTop: 4 }} />
              </div>
              <button onClick={handleSaveConfigs} disabled={loading} style={{ padding: "10px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer", marginTop: 8 }}>
                {loading ? "Atualizando..." : "Salvar Configurações"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}