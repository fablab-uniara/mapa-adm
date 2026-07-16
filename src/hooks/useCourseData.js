import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useCourseData(cursoId) {
  const [disciplines, setDisciplines] = useState([]);
  const [careers, setCareers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // Só busca se tivermos um cursoId válido
    if (!cursoId) {
      setDataLoading(false);
      return;
    }

    const fetchCourseInfo = async () => {
      setDataLoading(true);
      try {
        // Agora buscando de 'courses/[ID]/disciplines'
        const discsSnap = await getDocs(collection(db, `courses/${cursoId}/disciplinas`));
        setDisciplines(discsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Agora buscando de 'courses/[ID]/careers'
        const careersSnap = await getDocs(collection(db, `courses/${cursoId}/careers`));
        setCareers(careersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
      } catch (error) {
        console.error("Erro ao carregar dados do curso:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchCourseInfo();
  }, [cursoId]);

  return { disciplines, careers, dataLoading };
}