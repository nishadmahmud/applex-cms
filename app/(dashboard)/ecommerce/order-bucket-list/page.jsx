"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Search, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSearchCustomerBasketMutation } from "@/app/store/api/orderBucketApi";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function OrderBucketListPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id || session?.user?.user_id;
    const token = session?.accessToken;

    const today = new Date().toISOString().split("T")[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const [phone, setPhone] = useState("");
    const [nameFilter, setNameFilter] = useState("");
    const [startDate, setStartDate] = useState(firstOfMonth);
    const [endDate, setEndDate] = useState(today);

    const [searchBasket, { isLoading }] = useSearchCustomerBasketMutation();
    const [results, setResults] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = useCallback(async (phoneOverride) => {
        if (!userId) return;

        const res = await searchBasket({
            payload: {
                user_id: Number(userId),
                start_date: startDate,
                end_date: endDate,
                customer_phone: (phoneOverride ?? phone).trim(),
            },
            token,
        });

        const data = res?.data?.data || res?.data || [];
        setResults(Array.isArray(data) ? data : []);
        setSearched(true);
    }, [userId, startDate, endDate, phone, token, searchBasket]);

    // Auto-search when user stops typing in phone field (500ms debounce)
    const debounceRef = useRef(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (userId) handleSearch(phone);
        }, 500);
        return () => clearTimeout(debounceRef.current);
    }, [phone]);

    const handleReset = () => {
        setPhone("");
        setNameFilter("");
        setStartDate(firstOfMonth);
        setEndDate(today);
        setResults(null);
        setSearched(false);
    };

    // Filter by customer name on the frontend
    const filtered = results
        ? results.filter((r) => {
            const name = (r.customer_name || r.customer?.name || "").toLowerCase();
            return !nameFilter || name.includes(nameFilter.toLowerCase());
        })
        : [];

    return (
        <ProtectedRoute featureName="Ecommerce" optionName="Orders">
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <ShoppingBasket className="w-7 h-7 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Order Bucket List</h1>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <Label>Customer Phone</Label>
                                <Input
                                    placeholder="Search by phone..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button
                                    onClick={handleSearch}
                                    disabled={isLoading || !userId}
                                    className="flex-1"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    {isLoading ? "Searching…" : "Search"}
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {searched && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <CardTitle className="text-lg">
                                    Results {filtered.length > 0 && <span className="text-gray-400 text-base font-normal ml-2">({filtered.length} orders)</span>}
                                </CardTitle>
                                {results && results.length > 0 && (
                                    <Input
                                        placeholder="Filter by customer name…"
                                        value={nameFilter}
                                        onChange={(e) => setNameFilter(e.target.value)}
                                        className="max-w-xs"
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Products</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-10 text-gray-400 italic">
                                                    No basket orders found for the selected filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filtered.map((order, idx) => (
                                                <TableRow key={order.id || idx}>
                                                    <TableCell className="text-gray-500">{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{order.customer_name || order.customer?.name || "—"}</div>
                                                        <div className="text-xs text-gray-400">{order.customer_email || order.customer?.email || ""}</div>
                                                    </TableCell>
                                                    <TableCell>{order.customer_phone || order.customer?.phone || "—"}</TableCell>
                                                    <TableCell>
                                                        {Array.isArray(order.basket_details || order.items) ? (
                                                            <ul className="text-xs text-gray-600 space-y-0.5">
                                                                {(order.basket_details || order.items || []).map((item, i) => (
                                                                    <li key={i}>
                                                                        • {item.product_name || item.product?.name || `Product #${item.product_id}`}
                                                                        {item.qty && <span className="text-gray-400"> ×{item.qty}</span>}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">{fmt(order.total_amount || order.total)}</TableCell>
                                                    <TableCell className="text-sm text-gray-600">{fmtDate(order.created_at)}</TableCell>
                                                    <TableCell>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.status === "completed" || order.status === 1
                                                            ? "bg-green-100 text-green-700"
                                                            : order.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-gray-100 text-gray-600"
                                                            }`}>
                                                            {order.status || "—"}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
