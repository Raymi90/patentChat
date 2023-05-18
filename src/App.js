import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import React, { useEffect, useState } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return user ? <Dashboard /> : <Login />;
}

export default App;
