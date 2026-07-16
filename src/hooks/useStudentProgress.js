import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Mantemos a URL e Token da sua integração
const ESTUDAAI_URL = "https://ais-pre-hwmgrzo5yhw5krabhzuc4k-159345961516.us-east1.run.app/api/integration/mapa/sync";
const ESTUDAAI_TOKEN = "Gbx123";

export function useStudentProgress(user, disciplines, careers) {
  const [completed, setCompleted] = useState(new Set());
  const [completedMeta, setCompletedMeta] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Carrega o progresso e as experiências do aluno
  useEffect(() => {
    if (!user || disciplines.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "progress", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          // Lida com a migração do formato antigo (array) para o novo (meta)
          if (Array.isArray(data.completed)) {
            const now = new Date().toISOString();
            const meta = {};
            data.completed.forEach(id => { 
              meta[id] = { 
                completedAt: now, 
                semesterAtTime: disciplines.find(d => d.id === id)?.semester || 0, 
                migrated: true 
              }; 
            });
            setCompleted(new Set(data.completed));
            setCompletedMeta(meta);
            // Salva a conversão silenciosamente
            await setDoc(doc(db, "progress", user.uid), { completedMeta: meta, updatedAt: now }, { merge: true });
          } else if (data.completedMeta) {
            setCompleted(new Set(Object.keys(data.completedMeta)));
            setCompletedMeta(data.completedMeta);
          }
        }

        // Carrega as experiências do usuário
        const expSnap = await getDocs(collection(db, "experiences"));
        const myExps = expSnap.docs
          .filter(d => d.data().uid === user.uid)
          .map(d => ({ id: d.id, ...d.data() }));
        setExperiences(myExps);
        
      } catch (error) {
        console.error("Erro ao buscar progresso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, disciplines]); // Depende do user e das disciplinas já estarem carregadas

  // 2. Função auxiliar para envio ao webhook
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

  // 3. Detecção de marcos (Milestones)
  const detectMilestones = (discId, newSet, prevSet) => {
    const milestones = [];
    const disc = disciplines.find(d => d.id === discId);
    if (!disc) return milestones;

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

    const semDiscs = disciplines.filter(d => d.semester === disc.semester);
    const semPrev = semDiscs.every(d => prevSet.has(d.id));
    const semNow  = semDiscs.every(d => newSet.has(d.id));
    if (semNow && !semPrev) {
      milestones.push({ type: "semester_completed", semester: disc.semester, disciplines_count: semDiscs.length });
    }

    careers.forEach(career => {
      if (!career.disciplines.includes(discId)) return;
      const total = career.disciplines.length;
      const prevPct = Math.floor((career.disciplines.filter(id => prevSet.has(id)).length / total) * 100);
      const nowPct  = Math.floor((career.disciplines.filter(id => newSet.has(id)).length  / total) * 100);
      [25, 50, 75, 100].forEach(threshold => {
        if (prevPct < threshold && nowPct >= threshold) {
          milestones.push({ type: "career_milestone", career_id: career.id, career_name: career.name, threshold_pct: threshold, competencies: career.competencies });
        }
      });
    });

    return milestones;
  };

  // 4. Ações principais
  const toggleCompleted = (id) => {
    const disc = disciplines.find(d => d.id === id);
    setCompleted(prev => {
      const n = new Set(prev);
      let newMeta = { ...completedMeta };
      
      if (n.has(id)) {
        n.delete(id);
        delete newMeta[id];
      } else {
        n.add(id);
        newMeta[id] = { completedAt: new Date().toISOString(), semesterAtTime: disc?.semester || 0 };
        
        const milestones = detectMilestones(id, n, prev);
        if (milestones.length > 0) {
          sendToEstudaAi({
            student_uid: user.uid,
            student_name: user.name || user.displayName,
            student_email: user.email,
            // Aqui garantimos que o ecossistema saiba de qual curso vem a atualização!
            course_id: user.cursoId || "admin", 
            timestamp: new Date().toISOString(),
            total_completed: n.size,
            total_disciplines: disciplines.length,
            progress_pct: Math.round((n.size / disciplines.length) * 100),
            milestones
          });
        }
      }
      
      setCompletedMeta(newMeta);
      saveProgressState(n, newMeta);
      return n;
    });
  };

  const saveProgressState = async (newSet, newMeta) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "progress", user.uid), {
        completedMeta: newMeta,
        updatedAt: new Date().toISOString()
      });
    } finally { 
      setSaving(false); 
    }
  };

  const addExperience = async (form) => {
    const ref = await addDoc(collection(db, "experiences"), { 
      ...form, 
      uid: user.uid, 
      userName: user.name || user.displayName, 
      createdAt: new Date().toISOString() 
    });
    setExperiences(prev => [...prev, { id: ref.id, ...form, uid: user.uid }]);
  };

  const deleteExperience = async (id) => {
    await deleteDoc(doc(db, "experiences", id));
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  return { 
    completed, 
    experiences, 
    saving, 
    loadingProgress: loading, 
    toggleCompleted, 
    addExperience, 
    deleteExperience 
  };
}