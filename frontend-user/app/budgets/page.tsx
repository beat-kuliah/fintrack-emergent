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
import { Target, Plus, Trash2, Copy, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Budget {
  id: string;
  category: string;
  amount: number;
  budget_month: number;
  budget_year: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  
  // Current view month/year
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
  });

  const [copyData, setCopyData] = useState({
    fromMonth: new Date().getMonth(), // Previous month (0-indexed for display)
    fromYear: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchAllBudgets();
  }, []);

  useEffect(() => {
    filterBudgetsByMonth();
  }, [viewMonth, viewYear, allBudgets]);

  const fetchAllBudgets = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/budgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBudgets(response.data || []);
    } catch (err) {
      console.error("Failed to fetch budgets", err);
    } finally {
      setLoading(false);
    }
  };

  const filterBudgetsByMonth = () => {
    const filtered = allBudgets.filter(
      b => b.budget_month === viewMonth && b.budget_year === viewYear
    );
    setBudgets(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/budgets`,
        {
          category: formData.category,
          amount: parseFloat(formData.amount),
          budget_month: viewMonth,
          budget_year: viewYear,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDialogOpen(false);
      setFormData({ category: "", amount: "" });
      fetchAllBudgets();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create budget");
    }
  };

  const handleCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.post(
        `${API_URL}/budgets/copy`,
        {
          from_month: copyData.fromMonth + 1, // Convert to 1-indexed
          from_year: copyData.fromYear,
          to_month: viewMonth,
          to_year: viewYear,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCopyDialogOpen(false);
      alert(`Successfully copied ${response.data.copied} budgets!`);
      fetchAllBudgets();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to copy budgets");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllBudgets();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete budget");
    }
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.amount, 0);
  };

  const goToPreviousMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const openCopyDialog = () => {
    // Set default "from" to previous month
    let prevMonth = viewMonth - 1;
    let prevYear = viewYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = viewYear - 1;
    }
    setCopyData({
      fromMonth: prevMonth - 1, // 0-indexed for Select
      fromYear: prevYear,
    });
    setCopyDialogOpen(true);
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
      <div className="space-y-6" data-testid="budgets-page">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Set and track your spending limits
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openCopyDialog} data-testid="copy-budget-button">
              <Copy className="h-4 w-4 mr-2" />
              Copy from Previous
            </Button>
            <Button onClick={() => setDialogOpen(true)} data-testid="add-budget-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </div>

        {/* Month Navigator */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-6">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 min-w-[200px] justify-center">
                <Calendar className="h-5 w-5 text-amber-500" />
                <span className="text-xl font-bold dark:text-white">
                  {MONTHS[viewMonth - 1]} {viewYear}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Total Budget for {MONTHS[viewMonth - 1]}</CardTitle>
            <CardDescription className="text-amber-100">
              {budgets.length} budget categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">Rp {getTotalBudget().toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>

        {/* Budgets List */}
        <Card data-testid="budgets-list">
          <CardHeader>
            <CardTitle className="dark:text-white">Budget Categories</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Your spending limits for {MONTHS[viewMonth - 1]} {viewYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <div className="text-center py-12" data-testid="no-budgets-message">
                <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No budgets for {MONTHS[viewMonth - 1]} {viewYear}.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={openCopyDialog}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy from Previous Month
                  </Button>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700"
                    data-testid={`budget-item-${budget.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full text-amber-600 dark:text-amber-400">
                          <Target className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg dark:text-white">{budget.category}</h3>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(budget.id)}
                        data-testid={`delete-budget-${budget.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Budget Amount:</span>
                        <span className="font-bold text-2xl dark:text-white">
                          Rp {budget.amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {/* Progress bar placeholder */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Rp 0 spent of Rp {budget.amount.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Budget Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-testid="add-budget-dialog">
            <DialogHeader>
              <DialogTitle>Add Budget for {MONTHS[viewMonth - 1]} {viewYear}</DialogTitle>
              <DialogDescription>
                Set a spending limit for a specific category
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Food, Transport, Entertainment"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    data-testid="budget-category-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    data-testid="budget-amount-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-budget-button">
                  Create Budget
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Copy Budget Dialog */}
        <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
          <DialogContent data-testid="copy-budget-dialog">
            <DialogHeader>
              <DialogTitle>Copy Budgets to {MONTHS[viewMonth - 1]} {viewYear}</DialogTitle>
              <DialogDescription>
                Copy all budget categories from a previous month
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCopy}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Month</Label>
                    <Select
                      value={String(copyData.fromMonth)}
                      onValueChange={(value) => setCopyData({ ...copyData, fromMonth: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, idx) => (
                          <SelectItem key={idx} value={String(idx)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>From Year</Label>
                    <Select
                      value={String(copyData.fromYear)}
                      onValueChange={(value) => setCopyData({ ...copyData, fromYear: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026, 2027].map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    This will copy all budgets from <strong>{MONTHS[copyData.fromMonth]} {copyData.fromYear}</strong> to <strong>{MONTHS[viewMonth - 1]} {viewYear}</strong>.
                    Existing budgets will not be overwritten.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCopyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-copy-button">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Budgets
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
