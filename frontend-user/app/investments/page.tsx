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
import axios from "axios";
import { TrendingUp, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Investment {
  id: string;
  investment_type: string;
  name: string;
  purchase_value: number;
  current_value: number;
  quantity: number;
  purchase_date: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    investment_type: "",
    name: "",
    purchase_value: "",
    current_value: "",
    quantity: "",
    purchase_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/investments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvestments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch investments", err);
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
        `${API_URL}/investments`,
        {
          investment_type: formData.investment_type,
          name: formData.name,
          purchase_value: parseFloat(formData.purchase_value),
          current_value: parseFloat(formData.current_value),
          quantity: parseFloat(formData.quantity),
          purchase_date: formData.purchase_date,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDialogOpen(false);
      setFormData({
        investment_type: "",
        name: "",
        purchase_value: "",
        current_value: "",
        quantity: "",
        purchase_date: new Date().toISOString().split("T")[0],
      });
      fetchInvestments();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create investment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/investments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInvestments();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete investment");
    }
  };

  const getTotalInvested = () => {
    return investments.reduce((sum, inv) => sum + inv.purchase_value * inv.quantity, 0);
  };

  const getTotalCurrentValue = () => {
    return investments.reduce((sum, inv) => sum + inv.current_value * inv.quantity, 0);
  };

  const getTotalGainLoss = () => {
    return getTotalCurrentValue() - getTotalInvested();
  };

  const getGainLossPercentage = () => {
    if (getTotalInvested() === 0) return 0;
    return ((getTotalGainLoss() / getTotalInvested()) * 100).toFixed(2);
  };

  const getInvestmentGainLoss = (inv: Investment) => {
    return (inv.current_value - inv.purchase_value) * inv.quantity;
  };

  const getInvestmentPercentage = (inv: Investment) => {
    if (inv.purchase_value === 0) return 0;
    return (((inv.current_value - inv.purchase_value) / inv.purchase_value) * 100).toFixed(2);
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
      <div className="space-y-6" data-testid="investments-page">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Investments</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your investment portfolio
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="add-investment-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Invested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                Rp {getTotalInvested().toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                Rp {getTotalCurrentValue().toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>

          <Card
            className={
              getTotalGainLoss() >= 0
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                : "bg-gradient-to-br from-red-500 to-red-600 text-white"
            }
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={getTotalGainLoss() >= 0 ? "text-green-100" : "text-red-100"}
              >
                Total Gain/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    Rp {Math.abs(getTotalGainLoss()).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm mt-1">
                    {getTotalGainLoss() >= 0 ? "+" : "-"}
                    {getGainLossPercentage()}%
                  </p>
                </div>
                {getTotalGainLoss() >= 0 ? (
                  <ArrowUp className="h-12 w-12" />
                ) : (
                  <ArrowDown className="h-12 w-12" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investments List */}
        <Card data-testid="investments-list">
          <CardHeader>
            <CardTitle>Your Portfolio</CardTitle>
            <CardDescription>All your investments in one place</CardDescription>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-12" data-testid="no-investments-message">
                <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No investments yet. Add your first investment to start tracking.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => {
                  const gainLoss = getInvestmentGainLoss(investment);
                  const percentage = getInvestmentPercentage(investment);
                  const isProfit = gainLoss >= 0;

                  return (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700"
                      data-testid={`investment-item-${investment.id}`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={`p-3 rounded-full ${
                            isProfit
                              ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                          }`}
                        >
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg dark:text-white">
                                {investment.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {investment.investment_type} • {investment.quantity} units
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(investment.id)}
                              data-testid={`delete-investment-${investment.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Purchase Value
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                Rp {investment.purchase_value.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Current Value
                              </p>
                              <p className="text-sm font-semibold text-blue-600">
                                Rp {investment.current_value.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Gain/Loss</p>
                              <p
                                className={`text-sm font-semibold ${
                                  isProfit ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isProfit ? "+" : "-"}Rp {Math.abs(gainLoss).toLocaleString("id-ID")}
                              </p>
                              <p
                                className={`text-xs ${
                                  isProfit ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isProfit ? "+" : ""}
                                {percentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Investment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-testid="add-investment-dialog">
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
              <DialogDescription>Add an investment to your portfolio</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Investment Type</Label>
                  <Input
                    id="type"
                    placeholder="e.g., Stock, Mutual Fund, Crypto"
                    value={formData.investment_type}
                    onChange={(e) =>
                      setFormData({ ...formData, investment_type: e.target.value })
                    }
                    required
                    data-testid="investment-type-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Investment Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., BBCA, Bitcoin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="investment-name-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_value">Purchase Price</Label>
                    <Input
                      id="purchase_value"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.purchase_value}
                      onChange={(e) =>
                        setFormData({ ...formData, purchase_value: e.target.value })
                      }
                      required
                      data-testid="investment-purchase-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_value">Current Price</Label>
                    <Input
                      id="current_value"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.current_value}
                      onChange={(e) =>
                        setFormData({ ...formData, current_value: e.target.value })
                      }
                      required
                      data-testid="investment-current-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    data-testid="investment-quantity-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) =>
                      setFormData({ ...formData, purchase_date: e.target.value })
                    }
                    required
                    data-testid="investment-date-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-investment-button">
                  Add Investment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
