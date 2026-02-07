/**
 * Firebase Cloud Functions v2
 * Auto-checkout visitors daily at 7:30 PM (Asia/Manila)
 */

// const { onSchedule } = require("firebase-functions/v2/scheduler");
// const admin = require("firebase-admin");

// // Initialize Firebase Admin SDK
// admin.initializeApp();
// const db = admin.firestore();

/**
 * AUTO CHECKOUT VISITS
 * - Runs every day at 7:30 PM
 * - Automatically checks out ALL visitors still checked-in
 * - Works even if the app is not opened
 */
// exports.autoCheckoutVisits = onSchedule(
//   {
//     schedule: "30 19 * * *",
//     timeZone: "Asia/Manila",
//   },
//   async () => {
//     try {
//       console.log("⏰ Auto-checkout job started");

      // 🔍 Get all visits that are still checked-in
      // const snapshot = await db
      //   .collection("visits")
      //   .where("checkOutTime", "==", null)
      //   .get();

      // if (snapshot.empty) {
      //   console.log("✅ No active visits to auto-checkout");
      //   return;
      // }

//       const batch = db.batch();
//       let checkedOutCount = 0;

//       snapshot.docs.forEach((docSnap) => {
//         batch.update(docSnap.ref, {
//           status: "checked-out",
//           checkOutTime: admin.firestore.FieldValue.serverTimestamp(),
//           autoCheckedOut: true,
//         });
//         checkedOutCount++;
//       });

//       await batch.commit();

//       console.log(
//         `🚪 Auto-checkout completed. ${checkedOutCount} visit(s) checked out.`
//       );
//     } catch (error) {
//       console.error("❌ Auto-checkout failed:", error);
//     }
//   }
// );
