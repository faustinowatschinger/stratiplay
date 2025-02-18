import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const UserPlanContext = createContext();

export const useUserPlan = () => useContext(UserPlanContext);

export const UserPlanProvider = ({ children }) => {
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async (user) => {
      if (user) {
        const db = getFirestore();
        const userDoc = doc(db, 'usuarios', user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          setUserPlan(userSnapshot.data().plan);
        }
      }
      setLoading(false);
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserPlan(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserPlanContext.Provider value={{ userPlan, loading }}>
      {children}
    </UserPlanContext.Provider>
  );
};