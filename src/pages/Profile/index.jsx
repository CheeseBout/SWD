import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    setUser({ email: "Long", name: "HLong" });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-lg text-gray-600">Email: {user?.email}</p>
      <button
        className="mt-4 bg-red-500 text-white p-2 rounded"
        onClick={() => {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
