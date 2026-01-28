// feedbacks.service.js
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Add feedback linked to a visit
 * @param {Object} feedback
 *  - visitId: string (ID of the visit)
 *  - name: string
 *  - answers: object/map { "1": 5, "2": 4, ... }
 *  - suggestion: string
 */
export const addFeedback = async (feedback) => {
  try {
    console.log("🔵 addFeedback called with:", feedback);

    // Validate required fields
    if (!feedback.visitId || !feedback.name || !feedback.answers) {
      const errorMsg = "Missing required fields: visitId, name, or answers.";
      console.error("❌ Validation failed:", errorMsg);
      throw new Error(errorMsg);
    }

    // Validate answers is an object with at least one entry
    if (typeof feedback.answers !== 'object' || Object.keys(feedback.answers).length === 0) {
      const errorMsg = "Answers must be a non-empty object";
      console.error("❌ Validation failed:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("✅ Validation passed");

    // Calculate average rating
    const answerValues = Object.values(feedback.answers);
    const averageRating =
      answerValues.length > 0
        ? answerValues.reduce((sum, val) => sum + Number(val), 0) / answerValues.length
        : 0;

    console.log("📊 Calculated average rating:", averageRating);

    const feedbackData = {
      visitId: feedback.visitId,
      name: feedback.name,
      answers: feedback.answers,
      averageRating,
      suggestion: feedback.suggestion || "",
      createdAt: serverTimestamp(),
    };

    console.log("📝 Feedback data prepared:", feedbackData);
    console.log("🔥 Attempting to add to Firestore collection 'feedbacks'...");

    // Check if db is defined
    if (!db) {
      throw new Error("Firebase db is not initialized!");
    }

    const docRef = await addDoc(collection(db, "feedbacks"), feedbackData);
    
    console.log("✅ Feedback added successfully! ID:", docRef.id);

    return { id: docRef.id, ...feedbackData };
  } catch (error) {
    console.error("❌ Error adding feedback:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Fetch all feedbacks, optionally filtered by visitId
 * @param {string} [visitId] - optional visitId to fetch feedbacks for a specific visit
 */
export const fetchFeedbacks = async (visitId = null) => {
  try {
    console.log("🔍 Fetching feedbacks, visitId filter:", visitId);
    
    let q = collection(db, "feedbacks");
    if (visitId) {
      q = query(q, where("visitId", "==", visitId), orderBy("createdAt", "desc"));
    } else {
      q = query(q, orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(q);
    const feedbacks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    console.log(`✅ Fetched ${feedbacks.length} feedbacks`);
    return feedbacks;
  } catch (error) {
    console.error("❌ Error fetching feedbacks:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time feedbacks
 * @param {Function} callback - called with array of feedback objects
 * @param {string} [visitId] - optional visitId filter
 * @returns unsubscribe function
 */
export const subscribeFeedbacks = (callback, visitId = null) => {
  console.log("👂 Setting up real-time feedback subscription");
  
  let q = collection(db, "feedbacks");
  if (visitId) {
    q = query(q, where("visitId", "==", visitId), orderBy("createdAt", "desc"));
  } else {
    q = query(q, orderBy("createdAt", "desc"));
  }

  return onSnapshot(q, (snapshot) => {
    const feedbacks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(`📡 Real-time update: ${feedbacks.length} feedbacks`);
    callback(feedbacks);
  });
};

/**
 * Calculate average rating across multiple feedbacks
 * @param {Array} feedbacks - array of feedback objects
 * @returns {number} average rating
 */
export const calculateAverageRating = (feedbacks) => {
  if (!feedbacks.length) return 0;
  const total = feedbacks.reduce((sum, f) => sum + (f.averageRating || 0), 0);
  return total / feedbacks.length;
};