"use client";
import React, { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Download, X, Check, Loader2 } from "lucide-react";
import JsBarcode from "jsbarcode";
import { toPng } from "html-to-image";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const BarecodeCell = ({ value }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 1.5,
                    height: 30,
                    displayValue: true,
                    fontSize: 10,
                    margin: 0,
                });
            } catch (error) {
                console.error("Error generating barcode:", error);
            }
        }
    }, [value]);

    const handleDownload = () => {
        if (svgRef.current) {
            const node = document.createElement("div");
            node.style.background = "white";
            node.style.padding = "10px";
            node.style.display = "inline-block";
            document.body.appendChild(node);

            const clone = svgRef.current.cloneNode(true);
            node.appendChild(clone);

            toPng(node)
                .then((dataUrl) => {
                    const link = document.createElement("a");
                    link.download = `barcode-${value}.png`;
                    link.href = dataUrl;
                    link.click();
                    document.body.removeChild(node);
                })
                .catch((err) => {
                    console.error("Error downloading barcode:", err);
                    document.body.removeChild(node);
                });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-center bg-white p-1 rounded">
                <svg ref={svgRef}></svg>
            </div>
            <div className="flex flex-col gap-1">
                <button onClick={handleDownload} className="p-1 hover:bg-gray-100 rounded" title="Download Barcode">
                    <Download className="h-4 w-4 text-gray-600" />
                </button>
            </div>
        </div>
    );
};

const VariantRow = ({ item, index, onUpdate }) => {
    const { data: session } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({});

    // Initialize formData when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setFormData({
                imei: item.imei || "",
                sale_price: item.sale_price || 0,
                color: (item.color || "").trim(),
                storage: (item.storage || "").trim(),
                region: (item.region || "").trim(),
                battery_life: (item.battery_life || "").trim(),
                imei_id: item.id
            });
        }
    }, [isEditing, item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.imei) {
            toast.error("IMEI is required");
            return;
        }

        setIsSaving(true);

        try {
            // 1. Check IMEI Availability (only if IMEI changed)
            if (formData.imei !== item.imei) {
                const checkRes = await axios.post(
                    `${process.env.NEXT_PUBLIC_API}/check-product-imei`,
                    { imei: formData.imei, imei_id: item.id },
                    { headers: { Authorization: `Bearer ${session?.accessToken}` } }
                );

                if (checkRes.data?.available !== true) {
                    toast.error(checkRes.data?.message || "IMEI is not available");
                    setIsSaving(false);
                    return;
                }
            }

            // 2. Update Product IMEI
            // 2. Update Product IMEI
            // Force update with space for strings and 0 for numbers if empty
            const payload = {
                ...formData,
                color: formData.color || " ",
                storage: formData.storage || " ",
                region: formData.region || " ",
                battery_life: formData.battery_life || " ",
                sale_price: formData.sale_price === "" ? 0 : formData.sale_price
            };

            const updateRes = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/update-product-imei/${item.id}`,
                payload,
                { headers: { Authorization: `Bearer ${session?.accessToken}` } }
            );

            if (updateRes.data?.product_imei) {
                toast.success(updateRes.data?.message || "IMEI updated successfully!");
                onUpdate(updateRes.data.product_imei);
                setIsEditing(false);
            } else {
                toast.error("Failed to update: Invalid response");
            }

        } catch (error) {
            console.error("Update failed:", error);
            const msg = error?.response?.data?.message || "Failed to update variant";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isEditing) {
        return (
            <TableRow className="bg-blue-50/50">
                <TableCell className="font-medium align-top py-4">{index + 1}</TableCell>
                <TableCell className="align-top py-4">
                    <input
                        type="text"
                        name="imei"
                        value={formData.imei || ""}
                        onChange={handleChange}
                        className="w-full p-1 border rounded text-sm min-w-[120px]"
                        placeholder="IMEI"
                    />
                </TableCell>
                <TableCell className="align-top py-4 text-gray-500">
                    {item.optional_name || "-"}
                </TableCell>
                <TableCell className="align-top py-4 text-gray-500">
                    {item.purchase_price ? `${item.purchase_price} BDT` : "0 BDT"}
                </TableCell>
                <TableCell className="align-top py-4">
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            name="sale_price"
                            value={formData.sale_price || ""}
                            onChange={handleChange}
                            className="w-full p-1 border rounded text-sm max-w-[80px]"
                            placeholder="Price"
                        />
                        <span className="text-xs text-gray-500">BDT</span>
                    </div>
                </TableCell>
                <TableCell className="align-top py-4">
                    <input
                        type="text"
                        name="color"
                        value={formData.color || ""}
                        onChange={handleChange}
                        className="w-full p-1 border rounded text-sm max-w-[80px]"
                        placeholder="Color"
                    />
                </TableCell>
                <TableCell className="align-top py-4">
                    <input
                        type="text"
                        name="storage"
                        value={formData.storage || ""}
                        onChange={handleChange}
                        className="w-full p-1 border rounded text-sm max-w-[80px]"
                        placeholder="Storage"
                    />
                </TableCell>
                <TableCell className="align-top py-4">
                    <input
                        type="text"
                        name="region"
                        value={formData.region || ""}
                        onChange={handleChange}
                        className="w-full p-1 border rounded text-sm max-w-[60px]"
                        placeholder="Region"
                    />
                </TableCell>
                <TableCell className="align-top py-4">
                    <input
                        type="text"
                        name="battery_life"
                        value={formData.battery_life || ""}
                        onChange={handleChange}
                        className="w-full p-1 border rounded text-sm max-w-[60px]"
                        placeholder="Bat"
                    />
                </TableCell>
                <TableCell className="align-top py-4 text-gray-500">
                    {item.wholesale_price ? `${item.wholesale_price} BDT` : "0 BDT"}
                </TableCell>
                <TableCell className="align-top py-4">
                    <div className="flex gap-2 justify-center">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow>
            <TableCell className="font-medium align-middle">{index + 1}</TableCell>
            <TableCell className="align-middle">{item.imei || "-"}</TableCell>
            <TableCell className="align-middle">{item.optional_name || "-"}</TableCell>
            <TableCell className="align-middle">{item.purchase_price ? `${item.purchase_price} BDT` : "0 BDT"}</TableCell>
            <TableCell className="align-middle">{item.sale_price ? `${item.sale_price} BDT` : "0 BDT"}</TableCell>
            <TableCell className="align-middle">{(item.color && item.color.trim()) || "-"}</TableCell>
            <TableCell className="align-middle">{(item.storage && item.storage.trim()) || "-"}</TableCell>
            <TableCell className="align-middle">{(item.region && item.region.trim()) || "-"}</TableCell>
            <TableCell className="align-middle">{(item.battery_life && item.battery_life.trim()) || "N/A"}</TableCell>
            <TableCell className="align-middle">{item.wholesale_price ? `${item.wholesale_price} BDT` : "0 BDT"}</TableCell>
            <TableCell className="align-middle">
                <div className="flex items-center justify-center gap-2">
                    <BarecodeCell value={item.imei} />
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 hover:bg-gray-100 rounded text-blue-600"
                            title="Edit Variant"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default function VariantsModal({ open, onOpenChange, product }) {
    const [imeis, setImeis] = useState([]);

    useEffect(() => {
        if (product?.imeis) {
            setImeis(product.imeis);
        } else {
            setImeis([]);
        }
    }, [product]);

    const handleUpdateVariant = (updatedVariant) => {
        setImeis(prev => prev.map(item =>
            item.id === updatedVariant.id ? { ...item, ...updatedVariant } : item
        ));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1600px] w-[100vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-xl font-bold">Product SL/IMEI</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-[60px]">SL NO</TableHead>
                                <TableHead>SL/IMEI</TableHead>
                                <TableHead>Optional Name</TableHead>
                                <TableHead>Purchase Price</TableHead>
                                <TableHead>Sale Price</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Storage</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Battery</TableHead>
                                <TableHead>Wholesale Price</TableHead>
                                <TableHead className="text-center w-[200px]">Bar Code</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {imeis.length > 0 ? (
                                imeis.map((item, index) => (
                                    <VariantRow
                                        key={item.id || index}
                                        item={item}
                                        index={index}
                                        onUpdate={handleUpdateVariant}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-24 text-center">
                                        No variants found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
