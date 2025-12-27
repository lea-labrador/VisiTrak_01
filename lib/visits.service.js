import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Add a visitor log to Firestore
 * @param {Object} visit
 *  - name: string
 *  - office: string
 *  - purpose: string
 *  - satisfaction: number (1-5)
 *  - comment: string
 */
export const addVisit = async (visit) => {
  try {
    await addDoc(collection(db, "visits"), {
      ...visit,
      createdAt: serverTimestamp(),
    });
    console.log("Visit added successfully!");
  } catch (error) {
    console.error("Error adding visit:", error);
    throw error;
  }
};
