import React, { createContext, useContext, useState, useEffect } from "react";
// auth-context.jsx
import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el nombre y correo en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        name: name,
        email: email,
        uid: user.uid,
      });

      return user;
    } catch (error) {
      console.error("Error en el registro:", error);
      throw new Error("Error al registrar el usuario. Verifica los datos.");
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw new Error("Correo o contraseña incorrectos.");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Verifica si el usuario ya está en Firestore
      const userRef = doc(db, "usuarios", user.uid);
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
      }, { merge: true });

      return user;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw new Error("No se pudo iniciar sesión con Google.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
