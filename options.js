document.addEventListener("DOMContentLoaded", () => {
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  const setLimitBtn = document.getElementById("set-limit-btn");

  setLimitBtn.addEventListener("click", () => {
    const expenseLimit = document.getElementById("expense-limit").value;
    const user = auth.currentUser;
    if (user) {
      db.collection("users")
        .doc(user.uid)
        .set(
          {
            limit: parseFloat(expenseLimit),
          },
          { merge: true }
        )
        .then(() => {
          console.log("Limit set");
        })
        .catch((error) => {
          console.error("Error setting limit:", error);
        });
    }
  });

  auth.onAuthStateChanged((user) => {
    if (user) {
      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            document.getElementById("expense-limit").value =
              doc.data().limit || "";
          }
        });
    }
  });
});
