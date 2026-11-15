"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { authService } from "@/services/authService";

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();

    if (!token && requireAuth) {
      router.push("/login");
      return;
    }

    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    } else if (token) {
      authService.getMe().then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem("sms_user", JSON.stringify(res.data));
        } else if (requireAuth) {
          authService.logout();
          router.push("/login");
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [requireAuth, router]);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout, isAuthenticated: !!user };
}
