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
import { Coins, Plus, Trash2, ArrowUp, ArrowDown, TrendingUp, Scale, Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface GoldAsset {
  id: string;
  name: string;
  gold_type: string;
  weight_gram: number;
  purchase_price_per_gram: number;
  purchase_date: string;
  storage_location: string;
  notes: string;
  current_price_per_gram: number;
  current_value: number;
  purchase_value: number;
  profit_loss: number;
  profit_loss_percent: number;
}

interface GoldSummary {
  total_weight_gram: number;
  total_purchase_value: number;
  total_current_value: number;
  total_profit_loss: number;
  profit_loss_percent: number;
  current_price_per_gram: number;
  price_date: string;
}

const GOLD_TYPES = [
  { value: "antam", label: "Antam" },
  { value: "ubs", label: "UBS" },
  { value: "galeri24", label: "Galeri24" },
  { value: "pegadaian", label: "Pegadaian" },
  { value: "other", label: "Lainnya" },
];

export default function GoldPage() {
  const [assets, setAssets] = useState<GoldAsset[]>([]);
  const [summary, setSummary] = useState<GoldSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gold_type: "antam",
    weight_gram: "",
    purchase_price_per_gram: "",
    purchase_date: new Date().toISOString().split("T")[0],
    storage_location: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [assetsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/gold/assets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/gold/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAssets(assetsRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to fetch gold data", err);
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
        `${API_URL}/gold/assets`,
        {
          name: formData.name,
          gold_type: formData.gold_type,
          weight_gram: parseFloat(formData.weight_gram),
          purchase_price_per_gram: parseFloat(formData.purchase_price_per_gram),
          purchase_date: formData.purchase_date,
          storage_location: formData.storage_location,
          notes: formData.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDialogOpen(false);
      setFormData({
        name: "",
        gold_type: "antam",
        weight_gram: "",
        purchase_price_per_gram: "",
        purchase_date: new Date().toISOString().split("T")[0],
        storage_location: "",
        notes: "",
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add gold asset");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gold asset?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/gold/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete gold asset");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getGoldTypeLabel = (type: string) => {
    return GOLD_TYPES.find(t => t.value === type)?.label || type;
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
      <div className="space-y-6" data-testid="gold-page">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Emas</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your gold investments
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="add-gold-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Gold
          </Button>
        </div>

        {/* Current Price Info */}
        {summary && (
          <Card className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="h-8 w-8" />
                  <div>
                    <p className="text-sm text-yellow-100">Current Gold Price</p>
                    <p className="text-2xl font-bold">
                      Rp {summary.current_price_per_gram.toLocaleString("id-ID")}/gram
                    </p>
                  </div>
                </div>
                <div className="text-right text-yellow-100 text-sm">
                  Last updated: {summary.price_date || "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Total Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {summary?.total_weight_gram.toFixed(2) || 0} g
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold dark:text-white">
                Rp {(summary?.total_purchase_value || 0).toLocaleString("id-ID")}
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
              <p className="text-2xl font-bold text-amber-600">
                Rp {(summary?.total_current_value || 0).toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>

          <Card
            className={
              (summary?.total_profit_loss || 0) >= 0
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                : "bg-gradient-to-br from-red-500 to-red-600 text-white"
            }
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={
                  (summary?.total_profit_loss || 0) >= 0 ? "text-green-100" : "text-red-100"
                }
              >
                Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    Rp {Math.abs(summary?.total_profit_loss || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm mt-1">
                    {(summary?.total_profit_loss || 0) >= 0 ? "+" : "-"}
                    {(summary?.profit_loss_percent || 0).toFixed(2)}%
                  </p>
                </div>
                {(summary?.total_profit_loss || 0) >= 0 ? (
                  <ArrowUp className="h-10 w-10" />
                ) : (
                  <ArrowDown className="h-10 w-10" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gold Assets List */}
        <Card data-testid="gold-list">
          <CardHeader>
            <CardTitle className="dark:text-white">Your Gold Assets</CardTitle>
            <CardDescription className="dark:text-gray-400">All your gold in one place</CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-12" data-testid="no-gold-message">
                <Coins className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No gold assets yet. Add your first gold to start tracking.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gold
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assets.map((asset) => {
                  const isProfit = asset.profit_loss >= 0;

                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700"
                      data-testid={`gold-item-${asset.id}`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={`p-3 rounded-full ${
                            isProfit
                              ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                          }`}
                        >
                          <Coins className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg dark:text-white">
                                {asset.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {getGoldTypeLabel(asset.gold_type)} • {asset.weight_gram}g
                                {asset.storage_location && ` • ${asset.storage_location}`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(asset.id)}
                              data-testid={`delete-gold-${asset.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Purchase Price
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                Rp {asset.purchase_price_per_gram.toLocaleString("id-ID")}/g
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Purchase Value
                              </p>
                              <p className="text-sm font-semibold dark:text-white">
                                Rp {asset.purchase_value.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Current Value
                              </p>
                              <p className="text-sm font-semibold text-amber-600">
                                Rp {asset.current_value.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Profit/Loss</p>
                              <p
                                className={`text-sm font-semibold ${
                                  isProfit ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isProfit ? "+" : "-"}Rp {Math.abs(asset.profit_loss).toLocaleString("id-ID")}
                              </p>
                              <p
                                className={`text-xs ${
                                  isProfit ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isProfit ? "+" : ""}
                                {asset.profit_loss_percent.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            Purchased: {formatDate(asset.purchase_date)}
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

        {/* Add Gold Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg" data-testid="add-gold-dialog">
            <DialogHeader>
              <DialogTitle>Add Gold Asset</DialogTitle>
              <DialogDescription>Add a new gold to your portfolio</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name / Description</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Antam 10g Gift"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="gold-name-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gold_type">Gold Type</Label>
                    <Select
                      value={formData.gold_type}
                      onValueChange={(value) => setFormData({ ...formData, gold_type: value })}
                    >
                      <SelectTrigger data-testid="gold-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOLD_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight_gram">Weight (gram)</Label>
                    <Input
                      id="weight_gram"
                      type="number"
                      step="0.0001"
                      placeholder="10"
                      value={formData.weight_gram}
                      onChange={(e) => setFormData({ ...formData, weight_gram: e.target.value })}
                      required
                      data-testid="gold-weight-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">Purchase Price/gram</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      placeholder="1400000"
                      value={formData.purchase_price_per_gram}
                      onChange={(e) =>
                        setFormData({ ...formData, purchase_price_per_gram: e.target.value })
                      }
                      required
                      data-testid="gold-price-input"
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
                      data-testid="gold-date-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storage">Storage Location (optional)</Label>
                  <Input
                    id="storage"
                    placeholder="e.g., Safe deposit box, Home"
                    value={formData.storage_location}
                    onChange={(e) =>
                      setFormData({ ...formData, storage_location: e.target.value })
                    }
                    data-testid="gold-storage-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    data-testid="gold-notes-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-gold-button">
                  Add Gold
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
