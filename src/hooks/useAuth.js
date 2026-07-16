import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // Ajuste o caminho se necessário

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let data = {};
        if (userSnap.exists()) {
          data = userSnap.data();
        } else {
          // Valores padrão para novos alunos. 
          // O cursoId 'admin' pode virar dinâmico depois, caso a plataforma abra seleção no primeiro login.
          data = { 
            uid: currentUser.uid, 
            name: currentUser.displayName, 
            email: currentUser.email, 
            role: 'aluno', 
            cursoId: 'ADM' 
          };
        }
        
        // Atualiza log de acesso e foto
        await setDoc(userRef, { ...data, photoURL: currentUser.photoURL, lastLogin: new Date().toISOString() }, { merge: true });
        
        setUser(currentUser);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const login = async () => {
    setLoginLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  return { 
    user, 
    userData, 
    isCoord: userData?.role === 'coordenador', 
    cursoId: userData?.cursoId,
    authLoading, 
    loginLoading, 
    login, 
    logout 
  };
}