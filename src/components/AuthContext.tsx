import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isWorker: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAndCreateUserDoc = async (currentUser: User) => {
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      let role = 'user';
      
      // Check if they should be admin
      if (currentUser.email === 'ushakashyap2422@gmail.com') {
        role = 'admin';
      } else if (currentUser.email?.endsWith('@gmail.com')) {
        // Check if there are less than 2 admins
        const q = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminSnaps = await getDocs(q);
        if (adminSnaps.size < 2) {
          role = 'admin';
        }
      }

      await setDoc(userRef, {
        email: currentUser.email,
        role,
        displayName: currentUser.displayName || '',
        createdAt: new Date().toISOString()
      });
      setIsAdmin(role === 'admin');
      setIsWorker(role === 'worker');
    } else {
      const data = userSnap.data();
      setIsAdmin(data.role === 'admin' || currentUser.email === 'ushakashyap2422@gmail.com');
      setIsWorker(data.role === 'worker');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await checkAndCreateUserDoc(currentUser);
        } catch (error) {
          console.error("Error checking user doc:", error);
        }
      } else {
        setIsAdmin(false);
        setIsWorker(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing up with email", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isWorker, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
