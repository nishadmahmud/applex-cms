import {
  LayoutDashboard,
  Boxes,
  FilePlus2,
  ScrollText,
  ShoppingCart,
  ImagePlus,
  Tags,
  Newspaper,
  PercentCircle,
  ReceiptText,
  Undo2,
  Users,
  ClipboardList,
  FileText,
  Clock,
  PackagePlus,
  CornerUpLeft,
  Store,
  Wallet,
  List,
  CreditCard,
  Warehouse,
  UsersRound,
  Briefcase,
  Building,
  ShieldCheck,
  Factory,
  Truck,
  Banknote,
  Landmark,
  Send,
  BookText,
  History,
  BarChart3,
  Settings,
  Tag,
  Layers,
  Ruler,
  Megaphone,
  Star,
  Crosshair,
  Barcode,
  Video,
  BoxIcon,
  Grid,
  XCircle,
  Wrench,
} from "lucide-react";
import { TbMenuOrder, TbMusicDiscount } from "react-icons/tb";
import { MdEditAttributes, MdPending } from "react-icons/md";
import { FaBoxesPacking, FaLock } from "react-icons/fa6";
import { FaLocationPinLock } from "react-icons/fa6";
import { PiCodeSimpleDuotone } from "react-icons/pi";

export const menuSections = [
  {
    title: "Core",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        link: "/dashboard",
      },
      {
        name: "Analytics",
        icon: BarChart3,
        link: "/analytics",
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        name: "Products",
        icon: Boxes,
        children: [
          { name: "Add Product", icon: FilePlus2, link: "/add-products" },
          { name: "Product List", icon: ScrollText, link: "/products" },
          {
            name: "Size Charts",
            icon: Ruler,
            link: "/products/size-charts",
          },
          {
            name: "Barcode Generator",
            icon: Barcode,
            link: "/products/barcode",
          },
        ],
      },
      {
        name: "Warehouse",
        icon: Warehouse,
        link: "/warehouses",
      },
    ],
  },
  {
    title: "Sales & Commerce",
    items: [
      {
        name: "Ecommerce",
        icon: ShoppingCart,
        children: [
          {
            name: "Create Banner",
            icon: ImagePlus,
            link: "/ecommerce/create-banner",
          },
          { name: "Orders", icon: Tags, link: "/ecommerce/orders" },
          { name: "Order Bucket List", icon: Tags, link: "/ecommerce/order-bucket-list" },
          {
            name: "Refund Requests",
            icon: Undo2,
            link: "/sale/refund/all-refunds",
          },
          {
            name: "Create Slider",
            icon: ImagePlus,
            link: "/ecommerce/create-slider",
          },
          { name: "Blogs", icon: Newspaper, link: "/ecommerce/blogs" },
          {
            name: "Latest Offer",
            icon: PercentCircle,
            link: "/ecommerce/offers",
          },
          {
            name: "Coupons",
            icon: PercentCircle,
            link: "/ecommerce/coupons",
          },
          {
            name: "Campaigns",
            icon: Megaphone,
            link: "/ecommerce/campaign",
          },
          {
            name: "Bundles",
            icon: FaBoxesPacking,
            link: "/ecommerce/bundles",
          },
          {
            name: "New Customer Discounts",
            icon: TbMusicDiscount,
            link: "/ecommerce/new-customer-discounts",
          },
          {
            name: "Main Header",
            icon: TbMenuOrder,
            link: "/ecommerce/main-header",
          },
          {
            name: "Top Header",
            icon: TbMenuOrder,
            link: "/ecommerce/top-header",
          },
          {
            name: "Footer",
            icon: TbMenuOrder,
            link: "/ecommerce/footer",
          },
          {
            name: "Customer Reviews",
            icon: Star,
            link: "/ecommerce/customer-reviews",
          },
          {
            name: "Popup Banner",
            icon: ImagePlus,
            link: "/ecommerce/popup-banner",
          },
          {
            name: "Studio",
            icon: Video,
            link: "/ecommerce/studio",
          },
        ],
      },
      {
        name: "Sale",
        icon: ReceiptText,
        children: [
          { name: "Sale Billing", icon: ReceiptText, link: "/sale/billing" },
          // {
          //   name: "New Sale Billing",
          //   icon: FilePlus2,
          //   link: "/sale/new-billing",
          // },
          { name: "Sale Return", icon: Undo2, link: "/sale/return" },
          { name: "Sale Target", icon: Crosshair, link: "/sale/target" },
          // {
          //   name: "Advance Booking",
          //   icon: CalendarPlus,
          //   link: "/sale/booking",
          // },
          { name: "Customer List", icon: Users, link: "/sale/customers" },
          // { name: "Booking List", icon: ClipboardList, link: "/sale/bookings" },
          {
            name: "Sale Invoice",
            icon: FileText,
            link: "/invoice/all-sell-invoice",
          },
          {
            name: "Hold Invoice List",
            icon: Clock,
            link: "/invoice/hold-invoices",
          },
          {
            name: "Pending Invoice List",
            icon: MdPending,
            link: "/invoice/pending-invoices",
          },
          {
            name: "Complete Invoice List",
            icon: PiCodeSimpleDuotone,
            link: "/invoice/complete-invoices",
          },
          {
            name: "Cancel Invoice List",
            icon: XCircle,
            link: "/invoice/cancel-invoices",
          },
        ],
      },
      {
        name: "Wholesale",
        icon: Factory,
        children: [
          {
            name: "Wholesale Billing",
            icon: ReceiptText,
            link: "/wholesale/billing",
          },
          {
            name: "Wholesale List",
            icon: ClipboardList,
            link: "/wholesale/all-wholesale-invoices",
          },
          // {
          //   name: "Hold Wholesale Invoice",
          //   icon: Clock,
          //   link: "/wholesale/hold-invoices",
          // },
          {
            name: "Wholesaler List",
            icon: Users,
            link: "/wholesale/wholesalers",
          },
        ],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        name: "Purchase",
        icon: PackagePlus,
        children: [
          {
            name: "Purchase Billing",
            icon: PackagePlus,
            link: "/purchase/billing",
          },
          {
            name: "Purchase Return",
            icon: CornerUpLeft,
            link: "/purchase/return",
          },
          { name: "Vendor List", icon: Store, link: "/purchase/vendors" },
          {
            name: "Purchase Invoice",
            icon: FileText,
            link: "/purchase/all-purchase-invoices",
          },
          {
            name: "Hold Purchase Invoice",
            icon: Clock,
            link: "/purchase/hold-purchase-invoices",
          },

          // {
          //   name: "Recently Invoice",
          //   icon: Clock,
          //   link: "/purchase/recent-invoices",
          // },
        ],
      },
      {
        name: "Expense",
        icon: Wallet,
        children: [
          { name: "Expense List", icon: List, link: "/expense/list" },
          {
            name: "Expense Category List",
            icon: Tags,
            link: "/expense/categories",
          },
        ],
      },
      {
        name: "Quick Payment",
        icon: CreditCard,
        children: [
          {
            name: "Quick Payment List",
            icon: List,
            link: "/quick-payment/list",
          },
          {
            name: "Payment Category List",
            icon: Tags,
            link: "/quick-payment/categories",
          },
        ],
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        name: "Service Management",
        icon: Wrench,
        children: [
          {
            name: "New Service",
            icon: FilePlus2,
            link: "/services/create",
          },
          {
            name: "Service List",
            icon: List,
            link: "/services/list",
          },
          {
            name: "Service Types",
            icon: Tags,
            link: "/services/service-types",
          },
          {
            name: "Technicians",
            icon: Users,
            link: "/services/technicians",
          },
        ],
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        name: "HRM",
        icon: UsersRound,
        children: [
          { name: "Employee List", icon: Users, link: "/hrm/employees" },
          {
            name: "Designation List",
            icon: Briefcase,
            link: "/hrm/designations",
          },
          { name: "Department List", icon: Building, link: "/hrm/departments" },
          { name: "Role List", icon: ShieldCheck, link: "/hrm/roles" },
          {
            name: "Employees Salary",
            icon: Banknote,
            link: "/hrm/employees-salary",
          },
        ],
      },
      {
        name: "Payroll",
        icon: Banknote,
        link: "/payroll",
      },
      // {
      //   name: "Exporter",
      //   icon: Truck,
      //   children: [
      //     { name: "Exporter", icon: Factory, link: "/exporter/main" },
      //     { name: "Exporter User", icon: UserCog, link: "/exporter/users" },
      //     { name: "Carrier", icon: Truck, link: "/exporter/carriers" },
      //     { name: "Exporter Product", icon: Box, link: "/exporter/products" },
      //     { name: "Exporter Stock", icon: Boxes, link: "/exporter/stock" },
      //   ],
      // },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        name: "Finance",
        icon: Banknote,
        children: [
          // {
          //   name: "Chart of Account",
          //   icon: Landmark,
          //   link: "/finance/chart-of-account",
          // },
          // { name: "Party List", icon: Users, link: "/finance/party-list" },
          { name: "Fund Transfer", icon: Send, link: "/finance/fund-transfer" },
          // { name: "Journal List", icon: BookText, link: "/finance/journals" },
          // {
          //   name: "Party History",
          //   icon: History,
          //   link: "/finance/party-history",
          // },
        ],
      },
    ],
  },
  {
    title: "User Settings",
    items: [
      {
        name: "Settings",
        icon: Settings,
        children: [
          { name: "Brands", icon: Tag, link: "/settings/brands" },
          {
            name: "Invoice Settings",
            icon: Tag,
            link: "/settings/invoice-settings",
          },
          { name: "Category", icon: Layers, link: "/settings/category" },
          { name: "Sub Category", icon: List, link: "/settings/subcategory" },
          {
            name: "Child Category",
            icon: List,
            link: "/settings/child-category",
          },
          { name: "Units", icon: Ruler, link: "/settings/units" },
          {
            name: "Attributes",
            icon: MdEditAttributes,
            link: "/settings/attributes",
          },
          {
            name: "Additional Infos",
            icon: FileText,
            link: "/settings/additional-infos",
          },
          {
            name: "Authors",
            icon: BookText,
            link: "/settings/authors",
          },
          {
            name: "Specifications",
            icon: ScrollText,
            link: "/settings/specifications",
          },
          {
            name: "Variant Group",
            icon: Grid,
            link: "/settings/variant-group",
          },
          { name: "Warranty", icon: ShieldCheck, link: "/settings/warranty" },
          { name: "Couriers", icon: Truck, link: "/settings/couriers" },
          { name: "Payments", icon: CreditCard, link: "/settings/payments" },
          {
            name: "T & C",
            icon: FileText,
            link: "/settings/terms-and-conditions",
          },
          {
            name: "Reset Password",
            icon: FaLock,
            link: "/settings/reset-password",
          },
          {
            name: "Change PIN",
            icon: FaLocationPinLock,
            link: "/settings/change-pin",
          },
        ],
      },
    ],
  },
];
