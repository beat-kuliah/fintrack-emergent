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
import { CreditCard, Plus, Trash2, Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreditCardType {
  id: string;
  card_name: string;
  last_four_digits: string;
  credit_limit: number;
  current_balance: number;
  billing_date: number;
  payment_due_date: number;
}

export default function CreditCardsPage() {
  const [cards, setCards] = useState<CreditCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    card_name: "",
    last_four_digits: "",
    credit_limit: "",
    current_balance: "",
    billing_date: "",
    payment_due_date: "",
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/credit-cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCards(response.data || []);
    } catch (err) {
      console.error("Failed to fetch credit cards", err);
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
        `${API_URL}/credit-cards`,
        {
          card_name: formData.card_name,
          last_four_digits: formData.last_four_digits,
          credit_limit: parseFloat(formData.credit_limit),
          current_balance: parseFloat(formData.current_balance) || 0,
          billing_date: parseInt(formData.billing_date),
          payment_due_date: parseInt(formData.payment_due_date),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDialogOpen(false);
      setFormData({
        card_name: "",
        last_four_digits: "",
        credit_limit: "",
        current_balance: "",
        billing_date: "",
        payment_due_date: "",
      });
      fetchCards();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create credit card");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credit card?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/credit-cards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCards();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete credit card");
    }
  };

  const getTotalLimit = () => {
    return cards.reduce((sum, c) => sum + c.credit_limit, 0);
  };

  const getTotalBalance = () => {
    return cards.reduce((sum, c) => sum + c.current_balance, 0);
  };

  const getUtilization = (card: CreditCardType) => {
    return ((card.current_balance / card.credit_limit) * 100).toFixed(1);
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
      <div className="space-y-6" data-testid="credit-cards-page">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Cards</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your credit cards and track spending
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="add-card-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-100">Total Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">Rp {getTotalLimit().toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                Rp {getTotalBalance().toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Credit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                Rp {(getTotalLimit() - getTotalBalance()).toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards List */}
        <Card data-testid="cards-list">
          <CardHeader>
            <CardTitle>Your Credit Cards</CardTitle>
            <CardDescription>Track your credit card usage and limits</CardDescription>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <div className="text-center py-12" data-testid="no-cards-message">
                <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No credit cards yet. Add your first card to track spending.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credit Card
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="relative p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg"
                    data-testid={`card-item-${card.id}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <CreditCard className="h-8 w-8 text-yellow-400" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(card.id)}
                        className="text-white hover:bg-white/20"
                        data-testid={`delete-card-${card.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Card Name</p>
                        <p className="text-xl font-semibold">{card.card_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Card Number</p>
                        <p className="text-lg font-mono">•••• •••• •••• {card.last_four_digits}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Credit Limit</p>
                          <p className="text-sm font-semibold">
                            Rp {card.credit_limit.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Current Balance</p>
                          <p className="text-sm font-semibold text-yellow-400">
                            Rp {card.current_balance.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Utilization</span>
                          <span>{getUtilization(card)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              parseFloat(getUtilization(card)) > 70
                                ? "bg-red-500"
                                : parseFloat(getUtilization(card)) > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${getUtilization(card)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Billing: {card.billing_date}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {card.payment_due_date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Card Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-testid="add-card-dialog">
            <DialogHeader>
              <DialogTitle>Add New Credit Card</DialogTitle>
              <DialogDescription>Add a credit card to track your spending</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="card_name">Card Name</Label>
                  <Input
                    id="card_name"
                    placeholder="e.g., BCA Visa Platinum"
                    value={formData.card_name}
                    onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                    required
                    data-testid="card-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_four">Last 4 Digits</Label>
                  <Input
                    id="last_four"
                    placeholder="1234"
                    maxLength={4}
                    value={formData.last_four_digits}
                    onChange={(e) =>
                      setFormData({ ...formData, last_four_digits: e.target.value })
                    }
                    required
                    data-testid="card-digits-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credit_limit">Credit Limit</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                      required
                      data-testid="card-limit-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_balance">Current Balance</Label>
                    <Input
                      id="current_balance"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.current_balance}
                      onChange={(e) =>
                        setFormData({ ...formData, current_balance: e.target.value })
                      }
                      data-testid="card-balance-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing_date">Billing Date (1-31)</Label>
                    <Input
                      id="billing_date"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="1"
                      value={formData.billing_date}
                      onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
                      required
                      data-testid="card-billing-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_due">Payment Due (1-31)</Label>
                    <Input
                      id="payment_due"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      value={formData.payment_due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_due_date: e.target.value })
                      }
                      required
                      data-testid="card-due-input"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-card-button">
                  Add Card
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
