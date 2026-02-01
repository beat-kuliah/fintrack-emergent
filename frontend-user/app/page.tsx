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
      // Verify token without blocking the page
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
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/30 dark:bg-green-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Glassmorphism Card */}
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-white/20 shadow-2xl relative z-10" data-testid="auth-card">
        <CardHeader className="space-y-3 text-center">
          {/* Animated Logo */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 p-4 rounded-2xl transform hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">💰</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 dark:from-blue-400 dark:via-purple-400 dark:to-green-400 bg-clip-text text-transparent">
            Financial Tracker
          </CardTitle>
          <CardDescription className="text-base dark:text-gray-300">
            {isLogin ? "✨ Welcome back! Let's manage your money" : "🚀 Start your financial journey today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2 transform transition-all duration-300">
                <Label htmlFor="fullName" className="text-sm font-semibold dark:text-gray-200">Full Name</Label>
                <Input
                  id="fullName"
                  data-testid="fullname-input"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-2 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white transition-all duration-200"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold dark:text-gray-200">Email</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold dark:text-gray-200">Password</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-2 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white transition-all duration-200"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded animate-shake" data-testid="error-message">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
              disabled={loading}
              data-testid="submit-button"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                isLogin ? "🔓 Sign In" : "🎉 Create Account"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-all duration-200"
              data-testid="toggle-auth-button"
            >
              {isLogin ? "Don't have an account? Sign up 🚀" : "Already have an account? Sign in 👋"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
