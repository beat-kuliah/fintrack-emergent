"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Wallet, Plus, Trash2, TrendingUp, CreditCard, PiggyBank } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    balance: "",
    currency: "IDR",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/accounts`,
        {
          name: formData.name,
          type: formData.type,
          balance: parseFloat(formData.balance) || 0,
          currency: formData.currency,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDialogOpen(false);
      setFormData({ name: "", type: "bank", balance: "", currency: "IDR" });
      fetchAccounts();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create account");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete account");
    }
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

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  if (loading) {
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
      <div className="space-y-6" data-testid="accounts-page">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Accounts</h2>
            <p className="text-gray-500 mt-1">Manage your financial accounts</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="add-account-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Total Balance</CardTitle>
            <CardDescription className="text-blue-100">
              Across all {accounts.length} accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              Rp {getTotalBalance().toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card data-testid="accounts-list">
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>All your financial accounts in one place</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12" data-testid="no-accounts-message">
                <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No accounts yet. Create your first account to get started.</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid={`account-item-${account.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {account.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-xl">
                          {account.currency} {account.balance.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(account.id)}
                        data-testid={`delete-account-${account.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Account Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-testid="add-account-dialog">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>
                Create a new financial account to track your balance
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Bank Account"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="account-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Account Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger data-testid="account-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Initial Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    data-testid="account-balance-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger data-testid="account-currency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-account-button">
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
