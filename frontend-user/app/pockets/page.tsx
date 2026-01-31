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
import { PiggyBank, Plus, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Pocket {
  id: string;
  account_id: string;
  name: string;
  balance: number;
  percentage_allocation: number;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export default function PocketsPage() {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_id: "",
    name: "",
    balance: "",
    percentage_allocation: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [pocketsRes, accountsRes] = await Promise.all([
        axios.get(`${API_URL}/pockets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPockets(pocketsRes.data || []);
      setAccounts(accountsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
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
        `${API_URL}/pockets`,
        {
          account_id: formData.account_id,
          name: formData.name,
          balance: parseFloat(formData.balance) || 0,
          percentage_allocation: parseFloat(formData.percentage_allocation) || 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDialogOpen(false);
      setFormData({ account_id: "", name: "", balance: "", percentage_allocation: "" });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create pocket");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pocket?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/pockets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete pocket");
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Unknown Account";
  };

  const getTotalBalance = () => {
    return pockets.reduce((sum, p) => sum + p.balance, 0);
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
      <div className="space-y-6" data-testid="pockets-page">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pockets</h2>
            <p className="text-gray-500 mt-1">Organize your money into different pockets</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="add-pocket-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Pocket
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Total in Pockets</CardTitle>
            <CardDescription className="text-purple-100">
              Across all {pockets.length} pockets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">Rp {getTotalBalance().toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>

        {/* Pockets List */}
        <Card data-testid="pockets-list">
          <CardHeader>
            <CardTitle>Your Pockets</CardTitle>
            <CardDescription>Money allocated to different purposes</CardDescription>
          </CardHeader>
          <CardContent>
            {pockets.length === 0 ? (
              <div className="text-center py-12" data-testid="no-pockets-message">
                <PiggyBank className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">
                  No pockets yet. Create your first pocket to organize your money.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pocket
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pockets.map((pocket) => (
                  <div
                    key={pocket.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                    data-testid={`pocket-item-${pocket.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                        <PiggyBank className="h-6 w-6" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(pocket.id)}
                        data-testid={`delete-pocket-${pocket.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{pocket.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {getAccountName(pocket.account_id)}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Balance:</span>
                        <span className="font-bold text-lg">
                          Rp {pocket.balance.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {pocket.percentage_allocation > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Allocation:</span>
                          <span className="text-sm font-medium text-purple-600">
                            {pocket.percentage_allocation}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Pocket Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-testid="add-pocket-dialog">
            <DialogHeader>
              <DialogTitle>Add New Pocket</DialogTitle>
              <DialogDescription>
                Create a new pocket to organize your money by purpose
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Parent Account</Label>
                  <Select
                    value={formData.account_id}
                    onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                    required
                  >
                    <SelectTrigger data-testid="pocket-account-select">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Pocket Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Emergency Fund, Vacation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="pocket-name-input"
                  />
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
                    data-testid="pocket-balance-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="percentage">Allocation Percentage</Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.percentage_allocation}
                    onChange={(e) =>
                      setFormData({ ...formData, percentage_allocation: e.target.value })
                    }
                    data-testid="pocket-percentage-input"
                  />
                  <p className="text-xs text-gray-500">
                    Percentage of income to automatically allocate to this pocket
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-pocket-button">
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
