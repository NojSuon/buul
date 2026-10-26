import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// The lite Firestore client is much smaller; live updates (for online play later) would need the
// full one.
import { getFirestore } from 'firebase/firestore/lite';

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

export const auth = getAuth(app);
export const db = getFirestore(app);
