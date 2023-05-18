import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import React, { useState } from "react";
function App() {
  const [user, setUser] = useState({
    name: "John",
    email: "",
  });

  return user ? <Dashboard /> : <Login />;
}

export default App;
