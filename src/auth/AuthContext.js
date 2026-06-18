import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { setCurrentStaff } from '../data/mock';

// Lightweight auth/session for the prototype. `user` null === Guest Mode.
// On web we remember guest/host sessions in localStorage so returning users skip
// the browse wall (UC-14 optional). Staff sessions are not remembered (they
// re-enter via Invite ID).
const AuthContext = createContext(null);
const KEY = 'safalevents_session';

const isWeb = Platform.OS === 'web';
function loadSaved() {
  if (!isWeb) return null;
  try {
    const s = window.localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function persist(user) {
  if (!isWeb) return;
  try {
    if (user && user.role !== 'staff') window.localStorage.setItem(KEY, JSON.stringify(user));
    else window.localStorage.removeItem(KEY);
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // The action the user was trying to take when they hit the auth wall, so we
  // can return them to it after a successful login (UC-14 "return to intent").
  const [pendingIntent, setPendingIntent] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    if (saved && saved.role !== 'staff') setUser(saved);
    setReady(true);
  }, []);

  const signIn = (u) => {
    setUser(u);
    persist(u);
  };
  const signOut = () => {
    setUser(null);
    persist(null);
    setCurrentStaff(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthed: !!user, ready, pendingIntent, setPendingIntent, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Helper used by browse screens: run `intent` if authed, else stash it and send
// the user to the Auth screen.
export function gateAction(auth, navigation, intent) {
  if (auth.isAuthed) {
    if (intent?.nav) navigation.navigate(intent.nav, intent.params || {});
  } else {
    auth.setPendingIntent(intent || null);
    navigation.navigate('Auth');
  }
}
