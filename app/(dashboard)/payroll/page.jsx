"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    useGetEmployeeSalariesQuery,
    useCreateEmployeeSalaryMutation,
    useDeleteEmployeeSalaryMutation,
} from "@/app/store/api/employeeSalaryApi";
import {
    useGetPaymentListQuery,
} from "@/app/store/api/paymentApi";
import { useGetEmployeeWiseSalesQuery } from "@/app/store/api/employeeWiseSalesReportApi";
import useEmployees from "@/apiHooks/hooks/useEmployeesQuery";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Modal from "@/app/utils/Modal";
import {
    Loader2,
    Banknote,
    Plus,
    Trash2,
    DollarSign,
    Gift,
} from "lucide-react";
import { toast } from "sonner";

const fmt = (n) =>
    Number(n ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function PayrollPage() {
    const { data: session, status } = useSession();
    const token = session?.accessToken;

    // ── Date Filters ──
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [dateInput, setDateInput] = useState({
        start: firstDay.toISOString().split("T")[0],
        end: lastDay.toISOString().split("T")[0],
    });

    const [filters, setFilters] = useState({
        start_date: dateInput.start,
        end_date: dateInput.end,
        employee_id: "",
    });

    // ── Employee List ──
    const { data: empResult } = useEmployees({
        page: 1,
        limit: 200,
        keyword: "",
    });
    const employees = empResult?.data || [];

    // ── Payment Types (for resolving names in table) ──
    const { data: paymentListData } = useGetPaymentListQuery(undefined, {
        skip: !token,
    });
    const paymentTypes = useMemo(() => {
        const raw = paymentListData?.data?.data || paymentListData?.data || [];
        return Array.isArray(raw) ? raw : [];
    }, [paymentListData]);

    const getPaymentTypeName = (typeId) => {
        if (!typeId) return null;
        const found = paymentTypes.find((t) => String(t.id) === String(typeId));
        return found?.type_name || null;
    };

    // ── Salary Records ──
    const {
        data: salaryData,
        isLoading,
        isFetching,
    } = useGetEmployeeSalariesQuery(
        {
            employee_id: filters.employee_id,
            start_date: filters.start_date,
            end_date: filters.end_date,
            token,
        },
        { skip: !token }
    );

    const salaryRecords = useMemo(() => {
        const raw = salaryData?.data;
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === "object" && Array.isArray(raw.data)) return raw.data;
        return [];
    }, [salaryData]);

    // ── Summary ──
    const summary = useMemo(() => {
        let totalSalary = 0;
        let totalBonus = 0;
        let totalActualPaid = 0;
        salaryRecords.forEach((r) => {
            totalSalary += Number(r.salary ?? 0);
            totalBonus += Number(r.bonus ?? 0);
            // Sum actual payments from multiple_payments
            const payments = r.multiple_payments || r.payment_method || [];
            payments.forEach((pm) => {
                totalActualPaid += Number(pm.payment_amount ?? 0);
            });
        });

        // Base salary = sum of all currently filtered employee(s) base monthly salary
        const filteredEmployees = filters.employee_id
            ? employees.filter((e) => String(e.id) === String(filters.employee_id))
            : employees;
        const totalBaseSalary = filteredEmployees.reduce((sum, e) => {
            return sum + Number(e.salary_amount || 0);
        }, 0);

        const totalRemaining = Math.max(0, totalBaseSalary - totalActualPaid);

        return { totalSalary, totalBonus, total: totalSalary + totalBonus, totalBaseSalary, totalActualPaid, totalRemaining };
    }, [salaryRecords, employees, filters.employee_id]);

    // ── Delete ──
    const [deleteEmployeeSalary] = useDeleteEmployeeSalaryMutation();

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this salary record?")) return;
        try {
            await deleteEmployeeSalary({ id, token }).unwrap();
            toast.success("Salary record deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    // ── Modal ──
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* ── Header ── */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-emerald-600" />
                        Payroll
                    </CardTitle>
                    <div className="flex flex-col md:flex-row gap-3 items-end w-full md:w-auto">
                        {/* Employee Filter */}
                        <div className="w-full md:w-48">
                            <Label className="text-xs">Employee</Label>
                            <select
                                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                                value={filters.employee_id}
                                onChange={(e) =>
                                    setFilters((p) => ({ ...p, employee_id: e.target.value }))
                                }
                            >
                                <option value="">All Employees</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Date Range */}
                        <div>
                            <Label className="text-xs">Start Date</Label>
                            <Input
                                type="date"
                                className="h-9"
                                value={dateInput.start}
                                onChange={(e) =>
                                    setDateInput((p) => ({ ...p, start: e.target.value }))
                                }
                            />
                        </div>
                        <div>
                            <Label className="text-xs">End Date</Label>
                            <Input
                                type="date"
                                className="h-9"
                                value={dateInput.end}
                                onChange={(e) =>
                                    setDateInput((p) => ({ ...p, end: e.target.value }))
                                }
                            />
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setFilters((p) => ({
                                    ...p,
                                    start_date: dateInput.start,
                                    end_date: dateInput.end,
                                }))
                            }
                        >
                            Filter
                        </Button>
                        <Button size="sm" onClick={() => setModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Pay Salary
                        </Button>
                    </div>
                </CardHeader>

                {/* ── Summary Cards ── */}
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <div className="rounded-lg border p-4 flex items-center gap-3">
                            <DollarSign className="h-8 w-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg" />
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Base Salary (Total)
                                </p>
                                <p className="text-xl font-bold">{fmt(summary.totalBaseSalary)}</p>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4 flex items-center gap-3">
                            <Banknote className="h-8 w-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg" />
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Total Paid
                                </p>
                                <p className="text-xl font-bold text-emerald-600">{fmt(summary.totalActualPaid)}</p>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4 flex items-center gap-3">
                            <Gift className="h-8 w-8 text-amber-500 bg-amber-50 p-1.5 rounded-lg" />
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Total Bonus
                                </p>
                                <p className="text-xl font-bold">{fmt(summary.totalBonus)}</p>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4 bg-red-50 border-red-200 flex items-center gap-3">
                            <DollarSign className="h-8 w-8 text-red-500 bg-red-100 p-1.5 rounded-lg" />
                            <div>
                                <p className="text-xs font-medium text-red-500 uppercase tracking-wide">
                                    Remaining
                                </p>
                                <p className="text-xl font-bold text-red-600">{fmt(summary.totalRemaining)}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    {isLoading || isFetching ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className="text-right">Salary</TableHead>
                                    <TableHead className="text-right">Bonus</TableHead>
                                    <TableHead className="text-right">Paid Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Payment Methods</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salaryRecords.map((record, idx) => {
                                    const payments = record.multiple_payments || record.payment_method || [];
                                    const totalPaidAmount = payments.reduce((s, pm) => s + Number(pm.payment_amount || 0), 0);

                                    return (
                                        <TableRow key={record.id || idx}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell className="text-xs text-blue-700 font-medium whitespace-nowrap">
                                                {record.invoice_id || "-"}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {record.employee?.name ||
                                                    record.employee_name ||
                                                    record.employee_id ||
                                                    "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {fmt(record.salary)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {fmt(record.bonus)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-emerald-600">
                                                {fmt(totalPaidAmount)}
                                            </TableCell>
                                            <TableCell>
                                                {record.date
                                                    ? new Date(record.date).toLocaleDateString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {payments.length > 0 ? (
                                                    <div className="space-y-0.5">
                                                        {payments.map((pm, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-block mr-1 text-xs bg-gray-100 px-2 py-0.5 rounded"
                                                            >
                                                                {pm.payment_type?.type_name ||
                                                                    getPaymentTypeName(pm.payment_type_id) ||
                                                                    `Type #${pm.payment_type_id}`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No payments</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {!salaryRecords.length && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            No salary records found for this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* ── Pay Salary Modal ── */}
            <Modal
                title="Pay Salary"
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                Icon={Banknote}
                customDesignFor="employee_modal"
                content={
                    modalOpen ? (
                        <PaySalaryForm
                            token={token}
                            employees={employees}
                            dateFilters={{ start: dateInput.start, end: dateInput.end }}
                            onClose={() => setModalOpen(false)}
                        />
                    ) : null
                }
            />
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAY SALARY FORM (inside modal)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PaySalaryForm({ token, employees, dateFilters, onClose }) {
    const { data: session } = useSession();
    const [createEmployeeSalary, { isLoading: creating }] =
        useCreateEmployeeSalaryMutation();

    // ── Payment types (categories are nested inside each type as payment_type_category[]) ──
    const { data: paymentListData } = useGetPaymentListQuery(undefined, {
        skip: !session?.accessToken,
    });

    const paymentTypes = useMemo(() => {
        // The API returns nested data: { data: { data: [...] } }
        const raw = paymentListData?.data?.data || paymentListData?.data || [];
        return Array.isArray(raw) ? raw : [];
    }, [paymentListData]);

    // ── Form state ──
    const [form, setForm] = useState({
        employee_id: "",
        salary: "",
        bonus: "",
        date: new Date().toISOString().split("T")[0],
    });

    // ── Fetch employee salary & incentive data when employee is selected ──
    const selectedEmployee = useMemo(
        () => employees.find((e) => String(e.id) === String(form.employee_id)),
        [employees, form.employee_id]
    );

    // Pre-fill salary & bonus when employee changes
    useEffect(() => {
        if (selectedEmployee) {
            const baseSalary = Number(
                selectedEmployee.salary_amount || 0
            );
            const lastBonus = Number(
                selectedEmployee.salay_info?.bonus || 0
            );
            setForm((prev) => ({
                ...prev,
                salary: baseSalary > 0 ? String(baseSalary) : prev.salary,
                bonus: String(lastBonus),
            }));
        }
    }, [selectedEmployee]);

    // ── Payment methods ──
    const [payments, setPayments] = useState([
        { payment_type_id: "", payment_type_category_id: "", payment_amount: "" },
    ]);

    const addPaymentRow = () =>
        setPayments((p) => [
            ...p,
            { payment_type_id: "", payment_type_category_id: "", payment_amount: "" },
        ]);

    const removePaymentRow = (idx) =>
        setPayments((p) => p.filter((_, i) => i !== idx));

    const updatePayment = (idx, field, value) =>
        setPayments((p) =>
            p.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
        );

    // Get categories nested inside the selected payment type
    const getCategoriesForType = (typeId) => {
        if (!typeId) return [];
        const type = paymentTypes.find((t) => String(t.id) === String(typeId));
        return type?.payment_type_category || [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.employee_id) {
            toast.error("Please select an employee");
            return;
        }
        if (!form.salary || Number(form.salary) <= 0) {
            toast.error("Please enter a valid salary amount");
            return;
        }

        const payload = {
            employee_id: Number(form.employee_id),
            salary: Number(form.salary),
            bonus: Number(form.bonus || 0),
            date: form.date,
            payment_method: payments
                .filter((p) => p.payment_type_id && p.payment_amount)
                .map((p) => ({
                    payment_type_id: Number(p.payment_type_id),
                    payment_type_category_id: Number(p.payment_type_category_id),
                    payment_amount: Number(p.payment_amount),
                })),
        };

        try {
            await createEmployeeSalary({ payload, token }).unwrap();
            toast.success("Salary paid successfully!");
            onClose();
        } catch (err) {
            toast.error(
                err?.data?.message || err?.message || "Failed to create salary record"
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Employee */}
            <div>
                <Label>Employee *</Label>
                <select
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm mt-1"
                    value={form.employee_id}
                    onChange={(e) => {
                        const empId = e.target.value;
                        const emp = employees.find((x) => String(x.id) === String(empId));
                        const baseSalary = Number(emp?.salary_amount || 0);
                        const lastBonus = Number(emp?.salay_info?.bonus || 0);
                        setForm((prev) => ({
                            ...prev,
                            employee_id: empId,
                            salary: baseSalary > 0 ? String(baseSalary) : "",
                            bonus: String(lastBonus),
                        }));
                    }}
                    required
                >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name}{" "}
                            {emp.designation_info?.name
                                ? `(${emp.designation_info.name})`
                                : ""}
                        </option>
                    ))}
                </select>
            </div>

            {/* Pre-fill Info */}
            {selectedEmployee && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                    <p>
                        <span className="text-muted-foreground">Base Salary:</span>{" "}
                        <strong>
                            {selectedEmployee.salary_amount ? fmt(selectedEmployee.salary_amount) : "N/A"}
                        </strong>
                    </p>
                    <p>
                        <span className="text-muted-foreground">Last Bonus:</span>{" "}
                        <strong>
                            {fmt(selectedEmployee.salay_info?.bonus || 0)}
                        </strong>
                    </p>
                </div>
            )}

            {/* Salary + Bonus + Date */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <Label>Salary Amount *</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="mt-1"
                        placeholder="e.g. 15000"
                        value={form.salary}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, salary: e.target.value }))
                        }
                        required
                    />
                </div>
                <div>
                    <Label>Bonus (Incentive)</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="mt-1"
                        placeholder="Auto-filled from incentive"
                        value={form.bonus}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, bonus: e.target.value }))
                        }
                    />
                </div>
                <div>
                    <Label>Date *</Label>
                    <Input
                        type="date"
                        className="mt-1"
                        value={form.date}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, date: e.target.value }))
                        }
                        required
                    />
                </div>
            </div>

            {/* Payment Methods */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">Payment Methods</Label>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addPaymentRow}
                    >
                        <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                </div>

                <div className="space-y-3">
                    {payments.map((row, idx) => (
                        <div
                            key={idx}
                            className="grid gap-3 sm:grid-cols-4 items-end border rounded-lg p-3 bg-muted/30"
                        >
                            <div>
                                <Label className="text-xs">Payment Type</Label>
                                <select
                                    className="w-full h-9 rounded-md border bg-background px-3 text-sm mt-1"
                                    value={row.payment_type_id}
                                    onChange={(e) => {
                                        const typeId = e.target.value;
                                        const type = paymentTypes.find((t) => String(t.id) === String(typeId));
                                        const firstCat = type?.payment_type_category?.[0];
                                        setPayments((p) =>
                                            p.map((r, i) =>
                                                i === idx
                                                    ? {
                                                        ...r,
                                                        payment_type_id: typeId,
                                                        payment_type_category_id: firstCat?.id ? String(firstCat.id) : "",
                                                    }
                                                    : r
                                            )
                                        );
                                    }}
                                >
                                    <option value="">Select Type</option>
                                    {paymentTypes.map((pt) => (
                                        <option key={pt.id} value={pt.id}>
                                            {pt.type_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Only show Category when the selected type has categories */}
                            {getCategoriesForType(row.payment_type_id).length > 0 && (
                                <div>
                                    <Label className="text-xs">Account</Label>
                                    <select
                                        className="w-full h-9 rounded-md border bg-background px-3 text-sm mt-1"
                                        value={row.payment_type_category_id}
                                        onChange={(e) =>
                                            updatePayment(
                                                idx,
                                                "payment_type_category_id",
                                                e.target.value
                                            )
                                        }
                                    >
                                        {getCategoriesForType(row.payment_type_id).map((pc) => (
                                            <option key={pc.id} value={pc.id}>
                                                {pc.payment_category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <Label className="text-xs">Amount</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="mt-1 h-9"
                                    placeholder="0.00"
                                    value={row.payment_amount}
                                    onChange={(e) =>
                                        updatePayment(idx, "payment_amount", e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex justify-end">
                                {payments.length > 1 && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removePaymentRow(idx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={creating}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                    {creating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Paying...
                        </>
                    ) : (
                        <>
                            <Banknote className="h-4 w-4 mr-2" /> Pay Salary
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
