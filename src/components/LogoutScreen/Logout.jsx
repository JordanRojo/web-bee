import React, { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";

function LogOut() {
  const { setUserToken, setUserId } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    setUserToken(null);
    setUserId(null);
    navigate("/");
  }, []);

  return <></>;
}

export default LogOut;
