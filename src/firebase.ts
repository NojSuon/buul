import { initializeApp } from 'firebase/app';
import { browserPopupRedirectResolver, getAuth, inMemoryPersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// The web app's public Firebase configuration. These values identify the project and are meant to
// be visible in website code; the Firestore security rules (firestore.rules) protect the data.
// Analytics is deliberately not loaded, so players are not tracked.
const firebaseConfig = {
  apiKey: 'AIzaSyCZ4RkwEzf5xM3X7Np_tEyqhuJebiO2eBo',
  authDomain: 'buul-maya.firebaseapp.com',
  projectId: 'buul-maya',
  storageBucket: 'buul-maya.firebasestorage.app',
  messagingSenderId: '900543220944',
  appId: '1:900543220944:web:bbf891ca227aa8875562d5',
};

const app = initializeApp(firebaseConfig);

// Adding ?testsession to the address keeps the sign-in in this tab only, so two tabs can play an
// online game against each other as two different guests (for testing).
const testSession = new URLSearchParams(window.location.search).has('testsession');

export const auth = testSession
  ? initializeAuth(app, { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver })
  : getAuth(app);
export const db = getFirestore(app);
