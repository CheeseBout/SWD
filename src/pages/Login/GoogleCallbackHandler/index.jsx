import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("isLoggedIn", "true");

      navigate("/");
    } else {
      console.error("Không tìm thấy token từ Google.");
      navigate("/login");
    }
  }, [navigate]);

  return <p>Đang xử lý đăng nhập...</p>;
};

export default GoogleCallback;
