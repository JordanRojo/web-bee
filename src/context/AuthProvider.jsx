import React, { useState, useEffect } from "react";
import { createContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [correo, setCorreo] = useState(null);
  const [codigo, setCodigo] = useState(null);

  useEffect(() => {
    const checkLS = () => {
      try {
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("userId");
        if (token) setUserToken(token);
        if (user_id) setUserId(user_id);
      } catch (error) {
        console.log(error);
      }
    };
    checkLS();
  }, []);

  const setToken = (token) => {
    localStorage.setItem("token", token);
    setUserToken(token);
  };

  const setUser = (userId) => {
    localStorage.setItem("userId", userId);
    setUserId(userId);
  };

  const cleanLS = () => {
    localStorage.clear();
  };

  const config = { headers: { Authorization: "Bearer " + `${userToken}` } };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        setUserToken,
        setToken,
        cleanLS,
        userId,
        setUserId,
        setUser,
        correo,
        setCorreo,
        codigo,
        setCodigo,
        config,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
