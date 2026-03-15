// printStyles.js
export const salePadPrintStyles = `
  /* ===== Global Base ===== */
  * {
    box-sizing: border-box;
    font-family: Arial, Helvetica, "Helvetica Neue", sans-serif;
  }

  @page {
    margin: 15mm;
  }

  html, body {
    height: 100%;
    background: #fff;
  }

  body {
    font-size: 12px;
    color: #111;
    line-height: 1.5;
  }

  /* ===== Invoice Title ===== */
  .invoice-title {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #444;
    border-bottom: 1px solid #ccc;
    border-top: 1px solid #ccc;
    padding: 10px 0px;
    margin: 20px auto 20px auto;
  }

  /* ===== Invoice Header (Customer / Address / Barcode) ===== */
  .invoice-header {
    display: grid;
    grid-template-columns: 1.1fr 1fr 1.2fr;
    align-items: start;
    gap: 30px; /* horizontal gap between columns */
    margin-bottom: 20px;
    padding-top: 15px !important;
    padding-bottom: 10px !important;
  }

  /* ---- LEFT COLUMN ---- */
  .header-left {
    display: flex;
    flex-direction: column;
  }

  .hlabel {
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
   
  }

  .customer-name {
    font-weight: 600;
    font-size: 15px;
  }

  .meta {
    font-size: 13px;
    color: #555;
  }

  /* ---- CENTER COLUMN ---- */
  .header-center {
    display: flex;
    flex-direction: column;

  }

  .header-center .hlabel {
    font-weight: 700;
    font-size: 16px;
    text-transform: uppercase;
  }

  .header-center .value {
    font-size: 14px;
    color: #333;
  }

  /* ---- RIGHT COLUMN ---- */
  .header-right {
    text-align: right;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px; /* vertical gap between barcode and info */
  }

  .barcode {
    margin-bottom: 2px !important;
  }

 

  .invoice-info strong {
    font-weight: 600;
  }

  /* ===== Table Styling ===== */
  .invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px !important;
  }

  .invoice-table thead th {
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 8px 8px;
    text-align: center;
    font-weight: 700;
    font-size: 12px;
  }

  .invoice-table tbody td {
    border: 1px solid #e5e7eb;
    padding: 8px 8px;
    vertical-align: top;
    font-size: 12px;
  }
.name{
padding-left: 5px !important;
padding: 5px !important;

}
  .text-right { 
  text-align: right;
   }
  .text-center { text-align: center; }
  .text-left { text-align: left; }

  /* ===== Total Summary Section (Inside Table) ===== */
  .font-semibold {
    font-weight: 600;
  }

  .due {
    color: #b91c1c;
    font-weight: 700;
  }

  /* ===== Terms & Conditions ===== */
  h3.font-bold {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 6px;
    text-decoration: underline;
  }

  ul {
    margin: 0;
    padding-left: 18px;
  }
.name{
padding-left: 10px;
}
  li {
    margin-bottom: 3px;
    font-size: 16px;
    color: #333;
  }

  /* ===== General Layout / Bottom Info ===== */
  .bottom-row {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    font-size: 14px;
  }

  .terms-container {
    flex: 1;
  }

  .summary-container {
    flex: 0 0 260px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .summary-label {
    font-weight: 600;
  }

  .summary-value {
    font-weight: 500;
  }

  .due .summary-value {
    color: #b91c1c;
    font-weight: 700;
  }
    .terms{
    padding-top: 20px; !important;
    
    }

 /* ===== Fixed Footer ===== */
  .footer-fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 0;
    border-top: 1px solid #000;
    background: #fff; /* avoids overlap transparency on print */
  }

  /* ===== Ensure Proper Footer Behavior in Print ===== */
  @media print {
    body {
      margin: 0;
      padding-bottom: 60px;
    }

    .footer-fixed {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }
`;