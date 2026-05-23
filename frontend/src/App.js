import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("qb_token");
    const userId = localStorage.getItem("qb_user_id");
    if (token && userId) setUser({ token, userId });
  }, []);

  const handleLogin = (token, userId) => {
    localStorage.setItem("qb_token", token);
    localStorage.setItem("qb_user_id", userId);
    setUser({ token, userId });
  };

  const handleLogout = () => {
    localStorage.removeItem("qb_token");
    localStorage.removeItem("qb_user_id");
    setUser(null);
  };

  return (
    <div className="app">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;