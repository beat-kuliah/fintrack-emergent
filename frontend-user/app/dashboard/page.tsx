"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { LogOut, Wallet, TrendingUp, CreditCard, PiggyBank } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/");
      return;
    }

    setUser(JSON.parse(userData));
    fetchAccounts(token);
  }, [router]);

  const fetchAccounts = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data || []);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Wallet className="h-6 w-6" />;
      case "wallet":
        return <PiggyBank className="h-6 w-6" />;
      case "investment":
        return <TrendingUp className="h-6 w-6" />;
      case "credit_card":
        return <CreditCard className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200" data-testid="dashboard-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600" data-testid="app-title">
              💰 Financial Tracker
            </h1>
            <p className="text-sm text-gray-600" data-testid="user-greeting">
              Welcome back, {user?.full_name}!
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Total Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white" data-testid="total-balance-card">
          <CardHeader>
            <CardTitle className="text-white">Total Balance</CardTitle>
            <CardDescription className="text-blue-100">
              All accounts combined
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold" data-testid="total-balance">
              Rp {getTotalBalance().toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-accounts">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accounts</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-income">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rp 0</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-expenses">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rp 0</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-budgets">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budgets</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts List */}
        <Card data-testid="accounts-section">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Accounts</CardTitle>
                <CardDescription>Manage your financial accounts</CardDescription>
              </div>
              <Button data-testid="add-account-button">
                + Add Account
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12" data-testid="no-accounts-message">
                <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No accounts yet. Create your first account to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid={`account-item-${account.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{account.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {account.currency} {account.balance.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
