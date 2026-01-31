import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/");
      setLoading(false);
      return;
    }

    try {
      // Verify token dengan backend
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setLoading(false);
    } catch (err: any) {
      // Token invalid atau expired
      console.error("Auth failed:", err.response?.status);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
      setLoading(false);
    }
  };

  return { user, loading };
}
