import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return <h2 style={{ textAlign: "center", marginTop: "100px" }}>
    Logging you in...
  </h2>;
}

export default OAuthSuccess;