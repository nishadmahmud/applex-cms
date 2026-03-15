"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import { Button } from "@/components/ui/button";
import { Download, Printer, Barcode } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import BarcodeLabelSheet from "./BarcodeLabelSheet";

// simple debounce helper
const debounce = (func, delay = 500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function BarcodeGeneratorPage() {
  const { data: session } = useSession();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const gridRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // === Fetch initial products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!session?.accessToken) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `https://www.outletexpense.xyz/api/product?page=1&limit=10`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          },
        );
        const data = res?.data?.data?.data || [];
        setAllProducts(
          data.map((p) => ({
            value: p.id,
            label: p.name,
            product: p,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [session?.accessToken]);

  // === Debounced search request
  const debouncedSearch = useCallback(
    debounce(async (inputValue, callback, accessToken) => {
      if (!inputValue) {
        callback([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.post(
          `https://www.outletexpense.xyz/api/search-product-v1?page=1&limit=10`,
          { keyword: inputValue },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        const data = res?.data?.data?.data || [];
        const options = data.map((p) => ({
          value: p.id,
          label: p.name,
          product: p,
        }));
        callback(options);
      } catch (err) {
        console.error("Failed to search products", err);
        callback([]);
      } finally {
        setLoading(false);
      }
    }, 600),
    [],
  );

  const loadOptions = (inputValue, callback) => {
    const accessToken = session?.accessToken;
    if (!accessToken) return callback([]);
    debouncedSearch(inputValue, callback, accessToken);
  };

  const handleDownloadAll = async () => {
    if (!gridRef.current) return;
    try {
      // const dataUrl = await toPng(gridRef.current, {
      //   quality: 1,
      //   pixelRatio: 2,
      // });
      const dataUrl = await toPng(gridRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff", // ensures printed/downloaded PNG has white background
      });
      saveAs(dataUrl, `barcodes-${new Date().toISOString().split("T")[0]}.png`);
    } catch (err) {
      console.error("Error exporting barcodes:", err);
    }
  };

  const handlePrintAll = () => {
    if (!gridRef.current) return;

    const html = `
      <html>
        <head>
          <title>Barcode Sheet</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              body * { visibility: hidden; }
              .print-sheet, .print-sheet * { visibility: visible; }
              .print-sheet {
                position: absolute;
                top: 0; left: 0;
                width: 100%;
              }
            }

            body {
              margin: 0;
              padding: 10mm;
              background: #fff;
              font-family: Arial, sans-serif;
            }

            .print-sheet {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
              gap: 8px;
              justify-items: center;
            }

            .barcode-label-print {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">${gridRef.current.innerHTML}</div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank", "width=1200,height=850");
    if (w) w.onload = () => URL.revokeObjectURL(url);
  };

  // === NEW quantity update in the selected list
  const handleQuantityChange = (option, qty) => {
    const updated = selectedProducts.map((p) =>
      p.value === option.value ? { ...p, quantity: qty } : p,
    );
    setSelectedProducts(updated);
  };

  const handleProductChange = (options) => {
    const mapped = (options || []).map((opt) => ({
      ...opt,
      quantity: opt.quantity || 1,
    }));
    setSelectedProducts(mapped);
  };

  // === Custom MultiValue label with inline quantity
  const MultiValueLabel = (props) => {
    const { data } = props;
    const qty = data.quantity || 1;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexWrap: "nowrap",
        }}
      >
        <components.MultiValueLabel {...props}>
          {data.label}
        </components.MultiValueLabel>
        <input
          type="number"
          min="1"
          value={qty}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleQuantityChange(data, Number(e.target.value) || 1)
          }
          style={{
            width: "42px",
            fontSize: "0.75rem",
            border: "1px solid #94a3b8",
            borderRadius: "4px",
            padding: "1px 2px",
            textAlign: "center",
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Barcode className="w-6 h-6 text-blue-600" />
          Barcode Generator
        </h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadAll}
            disabled={!selectedProducts.length}
            variant="outline"
            className="flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Download All
          </Button>
          <Button
            onClick={handlePrintAll}
            disabled={!selectedProducts.length}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            <Printer className="w-4 h-4" />
            Print All
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-5 mb-10 shadow-sm">
        <p className="text-gray-700 mb-3 font-medium">
          Select multiple products to generate barcodes
        </p>
        <AsyncSelect
          isMulti
          isLoading={loading}
          defaultOptions={allProducts}
          loadOptions={loadOptions}
          classNamePrefix="react-select"
          onChange={handleProductChange}
          value={selectedProducts}
          placeholder="Choose products..."
          components={{ MultiValueLabel }}
          styles={{
            control: (base) => ({
              ...base,
              borderColor: "#cbd5e1",
              borderRadius: "8px",
              minHeight: "42px",
              fontSize: "0.9rem",
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              paddingRight: "4px",
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: "#0369a1",
              fontWeight: 500,
            }),
          }}
        />
      </div>

      {selectedProducts.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Preview ({selectedProducts.length})
          </h2>

          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {selectedProducts.map((option) =>
              Array.from({ length: option.quantity || 1 }).map((_, i) => (
                <BarcodeLabelSheet
                  key={`${option.product.id}-${i}`}
                  barcodeValue={String(option.product.serial)}
                  name={option.product.name}
                  price={option.product.retails_price}
                />
              )),
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-sm">
            No products selected. Use the select box above to begin.
          </p>
        </div>
      )}
    </div>
  );
}
