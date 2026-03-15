// components/pdf/PDFInvoice.jsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#010101',
  },
  barcodeContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 6,
  },
  textBold: {
    fontWeight: 'bold',
  },
  tableHeader: {
    backgroundColor: '#1e293b',
    color: '#fff',
    flexDirection: 'row',
    fontWeight: 'bold',
    padding: 6,
  },
  tableCell: {
    padding: 4,
    borderRight: '1 solid #ccc',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '1 solid #ccc',
  },
});

const PdfInvoice = ({ invoice, qrImage, barcodeImage }) => (
  <Document>
    <Page size="A4" style={styles.page} wrap>
      {/* Header with Logo, Title, Barcode */}
      <View style={styles.headerRow}>
        <Image
          src={invoice?.shop_logo || '/placeholder-logo.png'}
          style={styles.logo}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>INVOICE</Text>
        </View>
        <View style={styles.barcodeContainer}>
          {barcodeImage && <Image src={barcodeImage} style={{ width: 140, height: 40 }} />}
        </View>
      </View>

      <View style={styles.separator} />

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.textBold}>CUSTOMER DETAILS</Text>
        <Text>Name: {invoice?.data?.customer_name}</Text>
        <Text>Address: {invoice?.data?.customer_address}</Text>
        <Text>Phone: {invoice?.data?.customer_phone}</Text>
        <Text>Order ID: {invoice?.data?.invoice_id}</Text>
        <Text>Payment Mode: {invoice?.data?.pay_mode}</Text>
      </View>

      <View style={styles.separator} />

      {/* Product Table */}
      <View style={styles.section}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3 }]}>PRODUCT NAME</Text>
          <Text style={styles.tableCell}>PRICE</Text>
          <Text style={styles.tableCell}>QTY</Text>
          <Text style={[styles.tableCell, { borderRight: 'none' }]}>SUBTOTAL</Text>
        </View>

        {invoice?.data?.sales_details?.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{item?.product_info?.name}</Text>
            <Text style={styles.tableCell}>৳ {parseFloat(item?.price)?.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{item?.qty}</Text>
            <Text style={[styles.tableCell, { borderRight: 'none' }]}>৳ {(item?.qty * item?.price)?.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.separator} />

      {/* Summary */}
      <View style={styles.section}>
        <Text>Sub-total: ৳ {invoice?.data?.sub_total?.toFixed(2)}</Text>
        <Text>Discount: (-) ৳ {invoice?.data?.discount?.toFixed(2)}</Text>
        <Text>Advance Paid: (-) ৳ {parseFloat(invoice?.data?.paid_amount)?.toFixed(2)}</Text>
        <Text style={styles.textBold}>
          Total Due: ৳ {(invoice?.data?.sub_total - invoice?.data?.discount - invoice?.data?.paid_amount)?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.separator} />

      {/* QR + Footer */}
      <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <View>
          {qrImage && <Image src={qrImage} style={{ width: 70, height: 70 }} />}
        </View>
        <View>
          <Text style={styles.textBold}>THANK YOU FOR YOUR ORDER</Text>
          <Text>Phone: 01753486337</Text>
          <Text>Email: info@gadgetcheap.com</Text>
          <Text>
            Address: Estern Plaza, Bir Uttam C.R. Dutta Road, Hatirpool, Dhaka
          </Text>
          <Text style={{ marginTop: 8, fontSize: 9 }}>
            TERM & CONDITIONS: We provide 3 days replacement for manufacturing fault. Please make unboxing video before opening the box.
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default PdfInvoice;