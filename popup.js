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

  const loginSection = document.getElementById("login-section");
  const expenseSection = document.getElementById("expense-section");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const addExpenseBtn = document.getElementById("add-expense-btn");
  const setLimitBtn = document.getElementById("set-limit-btn");
  const notification = document.getElementById("notification");

  auth.onAuthStateChanged((user) => {
    if (user) {
      loginSection.style.display = "none";
      expenseSection.style.display = "block";
    } else {
      loginSection.style.display = "block";
      expenseSection.style.display = "none";
    }
  });

  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password).catch((error) => {
      console.error("Error signing in:", error);
    });
  });

  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.createUserWithEmailAndPassword(email, password).catch((error) => {
      console.error("Error signing up:", error);
    });
  });

  logoutBtn.addEventListener("click", () => {
    auth.signOut();
  });

  addExpenseBtn.addEventListener("click", () => {
    const expenseName = document.getElementById("expense-name").value;
    const expenseAmount = document.getElementById("expense-amount").value;
    const user = auth.currentUser;
    if (user) {
      db.collection("expenses")
        .add({
          uid: user.uid,
          name: expenseName,
          amount: expenseAmount,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          checkLimit(user.uid);
        })
        .catch((error) => {
          console.error("Error adding expense:", error);
        });
    }
  });

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

  function checkLimit(uid) {
    db.collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const limit = userData.limit || 0;
          db.collection("expenses")
            .where("uid", "==", uid)
            .get()
            .then((querySnapshot) => {
              let total = 0;
              querySnapshot.forEach((doc) => {
                total += doc.data().amount;
              });
              if (total > limit) {
                notification.style.display = "block";
              } else {
                notification.style.display = "none";
              }
            });
        }
      });
  }
});
