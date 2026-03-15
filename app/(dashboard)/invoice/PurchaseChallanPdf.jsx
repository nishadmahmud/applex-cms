/* eslint-disable react/prop-types */
import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from "@react-pdf/renderer";

// REGISTER BANGLA FONT
Font.register({
    family: "NotoSerifBengali",
    fonts: [
        { src: "/fonts/NotoSerifBengali-Regular.ttf" },
        { src: "/fonts/NotoSerifBengali-Bold.ttf", fontWeight: "bold" },
    ],
});

// Avoid hyphenation/splitting
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        paddingTop: 0,
        paddingBottom: 80,
        fontSize: 8,
        color: "#111827",
        fontFamily: "NotoSerifBengali",
    },

    // ----- HEADER -----
    headerWrapper: {
        width: "100%",
        height: 90,
        position: "relative",
        marginBottom: 2,
    },
    headerBase: {
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 20,
    },
    headerAngle: {
        position: "absolute",
        right: -80,
        top: 0,
        width: 450,
        height: "100%",
        backgroundColor: "#ffffff",
        transform: "skewX(35deg)",
    },
    headerLeft2: {
        position: "absolute",
        left: 24,
        top: 0,
        height: "100%",
        justifyContent: "center",
        zIndex: 5,
    },
    logo: {
        width: 60,
        objectFit: "contain",
    },
    headerRight2: {
        position: "absolute",
        right: 30,
        top: 20,
        width: 220,
        zIndex: 0,
    },
    shopRowRight: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 4,
    },
    shopIcon: {
        width: 12,
        height: 12,
        zIndex: 20,
        marginLeft: 6,
    },
    shopText: {
        fontSize: 10,
        color: "#111827",
        textAlign: "right",
        maxWidth: 180,
        zIndex: 20,
    },

    // Header bottom border
    wrapper: {
        position: "relative",
        width: "100%",
        height: 18,
    },
    leftLine: {
        position: "absolute",
        left: 0,
        top: 0,
        height: 4,
        width: "40%",
    },
    rightLine: {
        position: "absolute",
        right: 0,
        top: 0,
        height: 4,
        width: "75%",
    },
    rightAngle: {
        position: "absolute",
        right: -10,
        top: 6,
        bottom: 8,
        width: 150,
        height: 18,
        transform: "skewX(35deg)",
        borderLeftWidth: 20,
        borderLeftColor: "#ffffff",
    },

    // ----- VENDOR INFO -----
    container: {
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    titleRow: {
        alignItems: "center",
        marginBottom: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: "#BDBDBD",
        borderBottomColor: "#BDBDBD",
        paddingVertical: 6,
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    colLeft: {
        width: "50%",
    },
    colRight: {
        width: "45%",
    },
    labelc: {
        fontSize: 9,
        fontWeight: "bold",
        marginBottom: 4,
    },
    value: {
        fontSize: 9,
        marginBottom: 2,
    },
    valueBold: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 3,
    },

    // ----- CHALLAN TABLE -----
    challanTable: {
        marginHorizontal: 20,
        border: "1px solid #444",
        fontSize: 9,
        marginTop: 8,
    },
    challanRow: {
        flexDirection: "row",
        borderBottom: "1px solid #444",
        minHeight: 22,
    },
    challanHeader: {
        backgroundColor: "#f1f1f1",
        fontWeight: "bold",
    },
    challanNo: {
        width: "8%",
        borderRight: "1px solid #444",
        textAlign: "center",
        padding: 6,
    },
    challanDesc: {
        width: "76%",
        borderRight: "1px solid #444",
        padding: 6,
    },
    challanQty: {
        width: "16%",
        textAlign: "right",
        padding: 6,
    },
    challanName: {
        fontWeight: "bold",
    },
    challanImei: {
        fontSize: 8,
        marginTop: 2,
    },
    challanTotalRow: {
        flexDirection: "row",
        minHeight: 22,
        fontWeight: "bold",
    },
    challanTotalLabel: {
        width: "84%",
        borderRight: "1px solid #444",
        textAlign: "right",
        padding: 6,
        fontWeight: "bold",
        fontSize: 10,
    },
    challanTotalValue: {
        width: "16%",
        textAlign: "right",
        padding: 6,
        fontWeight: "bold",
        fontSize: 10,
    },

    // ----- SIGNATURE -----
    signatureSection: {
        marginTop: 50,
        paddingHorizontal: 30,
        alignItems: "flex-end",
    },
    sigBox: {
        width: 140,
        alignItems: "center",
    },
    sigLine: {
        borderTopWidth: 1,
        borderTopColor: "#9CA3AF",
        paddingTop: 4,
        fontSize: 9,
        fontWeight: "bold",
    },

    // ----- FOOTER -----
    footerRoot: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 45,
    },
    footerGreenBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 22,
    },
    footerOrangeBand: {
        position: "absolute",
        bottom: 14,
        left: 40,
        right: 40,
        height: 18,
        transform: "skewX(-12deg)",
        justifyContent: "center",
        alignItems: "center",
    },
    footerWebsiteText: {
        transform: "skewX(12deg)",
        fontSize: 9.5,
        fontWeight: "bold",
        color: "#0E6B57",
        letterSpacing: 1.5,
        textTransform: "lowercase",
    },

    // ----- WATERMARK -----
    watermark: {
        position: "absolute",
        top: "50%",
        left: "0%",
        width: "100%",
        textAlign: "center",
        opacity: 0.5,
        fontSize: 120,
        transform: "rotate(-45deg)",
    },

    pageNum: {
        position: "absolute",
        fontSize: 7,
        bottom: 2,
        right: 20,
        color: "#6B7280",
    },
});

/* ============ HEADER ============ */
function Header({ brandDark, logoUrl, invoice, user }) {
    const shopAddress = invoice?.user_info?.address || "N/A";
    const shopEmail =
        user?.invoice_settings?.email || invoice?.user_info?.email || "N/A";
    const invSettings =
        user?.invoice_settings || invoice?.user_info?.invoice_settings || {};
    const shopNumber =
        [invSettings?.mobile_number, invSettings?.additional_mobile_number]
            .filter(Boolean)
            .join(" / ") ||
        user?.phone ||
        invoice?.user_info?.phone ||
        "N/A";
    const brandLight =
        invoice?.user_info?.invoice_settings?.first_code || "#b5b5b5";
    const logo = logoUrl || null;

    return (
        <>
            <View style={styles.headerWrapper}>
                <View style={[styles.headerBase, { backgroundColor: brandDark }]} />
                <View style={styles.headerAngle} />
                <View style={styles.headerLeft2}>
                    <Image
                        src={
                            logo ||
                            "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
                        }
                        style={styles.logo}
                    />
                </View>
                <View style={styles.headerRight2}>
                    <View style={styles.shopRowRight}>
                        <Text style={styles.shopText}>{shopNumber}</Text>
                        <Image
                            src="https://cdn-icons-png.flaticon.com/512/724/724664.png"
                            style={styles.shopIcon}
                        />
                    </View>
                    <View style={styles.shopRowRight}>
                        <Text style={styles.shopText}>{shopEmail}</Text>
                        <Image
                            src="https://cdn-icons-png.flaticon.com/512/561/561127.png"
                            style={styles.shopIcon}
                        />
                    </View>
                    <View style={styles.shopRowRight}>
                        <Text style={styles.shopText}>{shopAddress}</Text>
                        <Image
                            src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                            style={styles.shopIcon}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.wrapper}>
                <View style={[styles.leftLine, { backgroundColor: brandDark }]} />
                <View style={[styles.rightLine, { backgroundColor: brandLight }]} />
                <View style={[styles.rightAngle, { backgroundColor: brandLight }]} />
            </View>
        </>
    );
}

/* ============ VENDOR INFO ============ */
function VendorInfo({ invoice }) {
    const vendor = invoice?.vendor || {};
    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>PURCHASE CHALLAN</Text>
            </View>

            <View style={styles.row}>
                {/* LEFT – VENDOR */}
                <View style={styles.colLeft}>
                    <Text style={styles.labelc}>Vendor</Text>
                    <Text style={styles.valueBold}>
                        {vendor.name || invoice?.vendor_name || "-"}
                    </Text>
                    <Text style={styles.value}>
                        Contact: {vendor.mobile_number || invoice?.vendor_phone || "-"}
                    </Text>
                    <Text style={styles.value}>
                        Client ID: {invoice?.custom_invoice_id || invoice?.invoice_id || "-"}
                    </Text>
                </View>

                {/* RIGHT – ADDRESS + DATE */}
                <View style={styles.colRight}>
                    <Text style={styles.labelc}>Address</Text>
                    <Text style={styles.value}>{vendor.address || "-"}</Text>
                    <Text style={[styles.value, { marginTop: 8 }]}>
                        Date:{" "}
                        {invoice?.created_at
                            ? new Date(invoice.created_at).toLocaleDateString()
                            : ""}
                    </Text>
                </View>
            </View>
        </View>
    );
}

/* ============ CHALLAN TABLE (N° | Description | Qty) ============ */
function ChallanTable({ invoice }) {
    const items = invoice?.purchase_details || [];

    // Calculate total quantity
    const totalQty = items.reduce((sum, item) => sum + Number(item?.qty ?? 0), 0);

    return (
        <View style={styles.challanTable}>
            {/* HEADER */}
            <View style={[styles.challanRow, styles.challanHeader]}>
                <Text style={styles.challanNo}>N°</Text>
                <Text style={styles.challanDesc}>Description(Code)</Text>
                <Text style={styles.challanQty}>Qty</Text>
            </View>

            {/* ITEMS */}
            {items.map((item, index) => {
                let name = item?.product_info?.name || item?.product_name || "Product";

                // handle variant names
                if (
                    item?.product_info?.have_product_variant ||
                    item?.have_product_variant ||
                    item?.product_variant
                ) {
                    const variantName = item?.product_variant?.name;
                    if (variantName) name += ` - ${variantName}`;
                    const childVariantName = item?.child_product_variant?.name;
                    if (childVariantName) name += ` - ${childVariantName}`;
                }

                // Append IMEI specs (Color, Storage, Region)
                const imeiData = item?.product_imei;
                if (Array.isArray(imeiData) && imeiData.length > 0) {
                    const first = imeiData[0];
                    const parts = [];
                    if (first.color) parts.push(`Color: ${first.color}`);
                    if (first.storage) parts.push(`Storage: ${first.storage}`);
                    if (first.region) parts.push(`Region: ${first.region}`);
                    if (parts.length > 0) name += ` (${parts.join(" | ")})`;
                }

                // Collect ALL IMEIs for this item
                const imeis = (item?.product_imei || [])
                    .map((i) => i.imei)
                    .filter(Boolean)
                    .join(", ");

                const qty = Number(item?.qty ?? 0);

                return (
                    <View key={index} style={styles.challanRow}>
                        <Text style={styles.challanNo}>{index + 1}</Text>
                        <View style={styles.challanDesc}>
                            <Text style={styles.challanName}>{name}</Text>
                            {imeis ? (
                                <Text style={styles.challanImei}>IMEI#{imeis}</Text>
                            ) : item?.product_info?.barcode ? (
                                <Text style={styles.challanImei}>
                                    Barcode: {item.product_info.barcode}
                                </Text>
                            ) : null}
                        </View>
                        <Text style={styles.challanQty}>{qty.toFixed(2)} Pcs</Text>
                    </View>
                );
            })}

            {/* TOTAL ROW */}
            <View style={styles.challanTotalRow}>
                <Text style={styles.challanTotalLabel}>Total</Text>
                <Text style={styles.challanTotalValue}>{totalQty}</Text>
            </View>
        </View>
    );
}

/* ============ SIGNATURE ============ */
function Signature() {
    return (
        <View style={styles.signatureSection}>
            <View style={styles.sigBox}>
                <Text style={styles.sigLine}>Authorized Signature</Text>
            </View>
        </View>
    );
}

/* ============ FOOTER ============ */
function FooterBar({ invoice }) {
    const invUser = invoice?.user_info || {};
    const invSet = invUser?.invoice_settings || {};
    const brandDark = invSet?.second_code || "#4d4d4d";
    const brandLight = invSet?.first_code || "#adadad";
    const website = invUser.web_address || invSet.web_address || "";

    return (
        <View style={styles.footerRoot} fixed>
            <View style={[styles.footerGreenBar, { backgroundColor: brandDark }]} />
            <View style={[styles.footerOrangeBand, { backgroundColor: brandLight }]}>
                <Text style={styles.footerWebsiteText}>{website}</Text>
            </View>
        </View>
    );
}

/* ============ MAIN DOCUMENT ============ */
export default function PurchaseChallanPdf({
    invoice,
    user,
    logoUrl,
}) {
    const inv = invoice || {};
    const wattermark = inv?.user_info?.invoice_settings?.watermark_text;
    const brandLight =
        inv?.user_info?.invoice_settings?.first_code || "#a9d0b8";
    const brandDark =
        inv?.user_info?.invoice_settings?.second_code || "#5c8a6d";

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <Text style={[styles.watermark, { color: brandLight }]}>
                    {wattermark}
                </Text>

                <Header
                    brandDark={brandDark}
                    logoUrl={logoUrl}
                    invoice={inv}
                    user={user}
                />

                <VendorInfo invoice={inv} />
                <ChallanTable invoice={inv} />
                <Signature />
                <FooterBar invoice={inv} />

                <Text
                    style={styles.pageNum}
                    render={({ pageNumber, totalPages }) =>
                        `Page ${pageNumber} / ${totalPages}`
                    }
                    fixed
                />
            </Page>
        </Document>
    );
}
