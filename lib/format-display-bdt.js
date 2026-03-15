// utils/formatBDT.js

export function formatBangladeshiAmount(amount) {
  if (amount == null || amount === "") return "0";

  const num = parseFloat(amount);

  if (isNaN(num)) return amount;

  // Intl for Bangladeshi-style grouping
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(num);
}
