import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function check() {
  const orderId = "D-100192";
  console.log("Checking Firebase for order:", orderId);
  
  const locSnap = await get(ref(db, `/deliveryLocations/${orderId}`));
  console.log("deliveryLocations:", locSnap.val());

  const riderSnap = await get(ref(db, `/orders/${orderId}/rider`));
  console.log("orders/rider:", riderSnap.val());

  const routeSnap = await get(ref(db, `/orders/${orderId}/route`));
  console.log("orders/route:", routeSnap.val());
}

check().catch(console.error);
