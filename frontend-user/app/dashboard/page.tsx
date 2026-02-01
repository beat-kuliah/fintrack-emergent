"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Wallet, TrendingUp, PiggyBank, Receipt } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface TransactionSummary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [accountsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/transactions/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { total_income: 0, total_expense: 0, balance: 0 } })),
      ]);

      setAccounts(accountsRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="dashboard-page">
        {/* Header with Animation */}
        <div className="transform transition-all duration-300">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 dark:from-blue-400 dark:via-purple-400 dark:to-green-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Welcome{user?.name ? ` ${user.name}` : ""} to your financial overview ✨
          </p>
        </div>

        {/* Stats Grid with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" data-testid="total-balance-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold" data-testid="total-balance">
                    Rp {getTotalBalance().toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-blue-100 mt-1">{accounts.length} accounts</p>
                </div>
                <Wallet className="h-12 w-12 text-blue-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" data-testid="stat-income">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    Rp {(summary?.total_income || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-200 dark:text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" data-testid="stat-expenses">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    Rp {(summary?.total_expense || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
                </div>
                <Receipt className="h-12 w-12 text-red-200 dark:text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" data-testid="stat-net">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    Rp {(summary?.balance || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Income - Expense</p>
                </div>
                <PiggyBank className="h-12 w-12 text-blue-200 dark:text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Section */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" data-testid="accounts-section">
          <CardHeader>
            <CardTitle className="dark:text-white">Recent Accounts</CardTitle>
            <CardDescription className="dark:text-gray-400">Your financial accounts overview</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid="no-accounts-message">
                <Wallet className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p>No accounts yet. Create your first account to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.slice(0, 5).map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-[1.02]"
                    data-testid={`account-item-${account.id}`}
                  >
                    <div>
                      <h3 className="font-semibold dark:text-white">{account.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {account.type.replace("_", " ")}
                      </p>
                    </div>
                    <p className="font-bold text-lg dark:text-white">
                      {account.currency} {account.balance.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
