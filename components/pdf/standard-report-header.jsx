import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    paddingBottom: 8,
    marginBottom: 10,
  },
  leftInfo: { width: "60%", flexDirection: "row", alignItems: "center" },
  logoWrap: {
    width: 60,
    height: 45,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 60, height: 45, objectFit: "contain" },
  leftText: { flex: 1 },
  shopName: { fontSize: 12, fontWeight: "bold", color: "#111827" },
  address: { fontSize: 8, color: "#374151", marginTop: 2 },
  contact: { fontSize: 8, color: "#4B5563", marginTop: 2 },
  rightInfo: { width: "38%", alignItems: "flex-end" },
  rightLine: { fontSize: 8, color: "#374151", lineHeight: 1.2 },
  title: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
  },
});

export default function StandardReportHeader({
  user,
  title = "Report",
  reportLabel = "Report",
  currency = "BDT",
  extraInfo = null, // optional JSX for special fields
  logoUrl, // optional override
  filters,
}) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";

  const logo = logoUrl || inv?.shop_logo || u?.logo || u?.profile_image || null;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || "";
  const email = inv?.email || u?.email || "";
  const web = inv?.web_address || u?.web_address || "";

  const gen = new Date();
  const genStr = `${gen.toISOString().slice(0, 10)} ${gen
    .toTimeString()
    .slice(0, 8)}`;

  const start = (filters?.start_date || "").toString().slice(0, 10);
  const end = (filters?.end_date || "").toString().slice(0, 10);

  return (
    <>
      <View style={styles.headerWrap}>
        <View style={styles.leftInfo}>
          <View style={styles.logoWrap}>
            {logo ? (
              <Image src={logo} style={styles.logo} />
            ) : (
              <Text style={{ fontSize: 9, color: "#6B7280" }}>No Logo</Text>
            )}
          </View>
          <View style={styles.leftText}>
            <Text style={styles.shopName}>{shopName}</Text>
            {!!address && <Text style={styles.address}>{address}</Text>}
            <Text style={styles.contact}>
              {phone ? `Phone: ${phone}` : ""}{" "}
              {email ? `| Email: ${email}` : ""} {web ? `| Web: ${web}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.rightInfo}>
          <Text style={styles.rightLine}>Report: {reportLabel}</Text>
          <Text style={styles.rightLine}>Currency: {currency}</Text>
          {start && end && (
            <Text style={styles.rightLine}>
              Period: {start} to {end}
            </Text>
          )}
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
          {extraInfo}
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
    </>
  );
}
