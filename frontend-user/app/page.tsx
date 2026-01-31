"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token
      axios
        .get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          // Token valid, redirect to dashboard
          router.push("/dashboard");
        })
        .catch(() => {
          // Token invalid, clear and stay on login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/dashboard");
      } else {
        await axios.post(`${API_URL}/auth/register`, {
          email,
          password,
          full_name: fullName,
        });
        setIsLogin(true);
        setError("");
        alert("Registration successful! Please login.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4">
      <Card className="w-full max-w-md" data-testid="auth-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center text-blue-600">
            💰 Financial Tracker
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to manage your finances" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  data-testid="fullname-input"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500" data-testid="error-message">
                {error}
              </p>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              data-testid="submit-button"
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-blue-600 hover:underline"
              data-testid="toggle-auth-button"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
