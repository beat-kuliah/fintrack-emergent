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
import { Wallet, Plus, Trash2, Banknote, CreditCard, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  parent_account_id?: string;
  sub_accounts?: Account[];
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Account | null>(null);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    currency: "IDR",
  });
  const [subFormData, setSubFormData] = useState({
    name: "",
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
          currency: formData.currency,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDialogOpen(false);
      setFormData({ name: "", type: "bank", currency: "IDR" });
      fetchAccounts();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create account");
    }
  };

  const handleSubAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !selectedParent) return;

    try {
      await axios.post(
        `${API_URL}/accounts`,
        {
          name: subFormData.name,
          type: "bank",
          currency: selectedParent.currency,
          parent_account_id: selectedParent.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubDialogOpen(false);
      setSubFormData({ name: "" });
      setSelectedParent(null);
      fetchAccounts();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create sub-account");
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

  const openSubAccountDialog = (account: Account) => {
    setSelectedParent(account);
    setSubDialogOpen(true);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAccounts(newExpanded);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Banknote className="h-6 w-6" />;
      case "wallet":
        return <Wallet className="h-6 w-6" />;
      case "cash":
        return <Banknote className="h-6 w-6" />;
      case "paylater":
        return <CreditCard className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getTotalBalance = () => {
    let total = 0;
    accounts.forEach(acc => {
      total += acc.balance;
      if (acc.sub_accounts) {
        acc.sub_accounts.forEach(sub => {
          total += sub.balance;
        });
      }
    });
    return total;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="dark:text-white">Loading...</p>
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your financial accounts</p>
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
            <CardTitle className="dark:text-white">Your Accounts</CardTitle>
            <CardDescription className="dark:text-gray-400">All your financial accounts in one place</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12" data-testid="no-accounts-message">
                <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No accounts yet. Create your first account to get started.</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id}>
                    {/* Main Account */}
                    <div
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 transition-colors"
                      data-testid={`account-item-${account.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Expand button */}
                        <button
                          onClick={() => toggleExpand(account.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          {expandedAccounts.has(account.id) ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg dark:text-white">{account.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {account.type.replace("_", " ")} • {account.sub_accounts?.length || 0} sub-accounts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-xl dark:text-white">
                            {account.currency} {account.balance.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubAccountDialog(account)}
                          data-testid={`add-sub-account-${account.id}`}
                        >
                          <FolderOpen className="h-4 w-4 mr-1" />
                          Add Pocket
                        </Button>
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

                    {/* Sub-accounts (Pockets) */}
                    {expandedAccounts.has(account.id) && account.sub_accounts && account.sub_accounts.length > 0 && (
                      <div className="ml-12 mt-2 space-y-2">
                        {account.sub_accounts.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-400 rounded"
                            data-testid={`sub-account-item-${sub.id}`}
                          >
                            <div className="flex items-center space-x-3">
                              <FolderOpen className="h-5 w-5 text-blue-500" />
                              <span className="font-medium dark:text-white">{sub.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold dark:text-white">
                                {sub.currency} {sub.balance.toLocaleString("id-ID")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(sub.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                Create a new financial account
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
                      <SelectItem value="wallet">E-Wallet</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="paylater">PayLater</SelectItem>
                    </SelectContent>
                  </Select>
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

        {/* Add Sub-Account Dialog */}
        <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
          <DialogContent data-testid="add-sub-account-dialog">
            <DialogHeader>
              <DialogTitle>Add Pocket to {selectedParent?.name}</DialogTitle>
              <DialogDescription>
                Create a sub-account (pocket) for organizing your funds
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubAccountSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sub-name">Pocket Name</Label>
                  <Input
                    id="sub-name"
                    placeholder="e.g., Emergency Fund, Vacation"
                    value={subFormData.name}
                    onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                    required
                    data-testid="sub-account-name-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSubDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-sub-account-button">
                  Create Pocket
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
