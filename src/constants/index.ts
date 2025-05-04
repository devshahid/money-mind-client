type ExpenseCategory = {
    name: string;
    color: string;
    backgroundColor: string;
    icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & {
        muiName: string;
    }; // Emoji, icon string, or React component
};
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

import FastfoodIcon from "@mui/icons-material/Fastfood";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MovieIcon from "@mui/icons-material/Movie";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CarRepairIcon from "@mui/icons-material/CarRepair";
import HandymanIcon from "@mui/icons-material/Handyman";
import SchoolIcon from "@mui/icons-material/School";
import HomeWorkIcon from "@mui/icons-material/HomeWork"; // Replacing with a similar icon
import ImportantDevicesIcon from "@mui/icons-material/ImportantDevices";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import PetsIcon from "@mui/icons-material/Pets";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyIcon from "@mui/icons-material/Money";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GppGoodIcon from "@mui/icons-material/GppGood";
import CasesIcon from "@mui/icons-material/Cases";
import Face3Icon from "@mui/icons-material/Face3";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export function getExpenseCategories(): ExpenseCategory[] {
    return [
        {
            name: "Food",
            icon: FastfoodIcon,
            color: "#F44336", // Red
            backgroundColor: "#FFE0B2", // Light orange
        },
        {
            name: "Fruits",
            icon: StorefrontIcon,
            color: "#FF5722", // Orange
            backgroundColor: "#FFF3E0",
        },
        {
            name: "Vegetables",
            icon: StorefrontIcon,
            color: "#4CAF50", // Green
            backgroundColor: "#E8F5E9",
        },
        {
            name: "Groceries",
            icon: LocalGroceryStoreIcon,
            color: "#2196F3", // Blue
            backgroundColor: "#E3F2FD",
        },
        {
            name: "Fuel",
            icon: LocalGasStationIcon,
            color: "#FFC107", // Amber
            backgroundColor: "#FFF8E1",
        },
        {
            name: "Travel",
            icon: AirportShuttleIcon,
            color: "#9C27B0", // Purple
            backgroundColor: "#F3E5F5",
        },
        {
            name: "Medical",
            icon: LocalHospitalIcon,
            color: "#E91E63", // Pink
            backgroundColor: "#FCE4EC",
        },
        {
            name: "Entertainment",
            icon: MovieIcon,
            color: "#795548", // Brown
            backgroundColor: "#F5F5F5",
        },
        {
            name: "Shopping",
            icon: AddShoppingCartIcon,
            color: "#FF7043", //Orange-Red
            backgroundColor: "#FBE9E7",
        },
        {
            name: "Bills & Utilities",
            icon: ReceiptIcon,
            color: "#607D8B", // Blue Grey
            backgroundColor: "#ECEFF1",
        },
        {
            name: "Vehical Servicing",
            icon: CarRepairIcon,
            color: "#00897B", //Teal
            backgroundColor: "#E0F2F1",
        },
        {
            name: "Maintenance & Repairs",
            icon: HandymanIcon,
            color: "#424242", // Dark Grey
            backgroundColor: "#FAFAFA",
        },
        {
            name: "Education",
            icon: SchoolIcon,
            color: "#3F51B5", // Indigo
            backgroundColor: "#E8EAF6",
        },
        {
            name: "EMI",
            icon: CreditCardIcon,
            color: "#546E7A", //Grey
            backgroundColor: "#F0F4C3",
        },
        {
            name: "Rent",
            icon: HomeWorkIcon,
            color: "#009688", // Teal
            backgroundColor: "#E0F7FA",
        },
        {
            name: "Recharge (Mobile, Fibre, TV..)",
            icon: ImportantDevicesIcon,
            color: "#8E24AA", //Dark Violet
            backgroundColor: "#F0F4C3",
        },
        {
            name: "Subscriptions",
            icon: SubscriptionsIcon,
            color: "#D84315", //Dark Orange
            backgroundColor: "#FBE9E7",
        },
        {
            name: "Memberships (Gym, Club..)",
            icon: CardMembershipIcon,
            color: "#26A69A", // Cyan
            backgroundColor: "#E0F7FA",
        },
        {
            name: "Income",
            icon: AccountBalanceWalletIcon,
            color: "#4CAF50", // Green
            backgroundColor: "#E8F5E9",
        },
        {
            name: "Lending",
            icon: MoneyIcon,
            color: "#03A9F4", // Light Blue
            backgroundColor: "#E1F5FE",
        },
        {
            name: "Borrowed",
            icon: CallReceivedIcon,
            color: "#F9A8D4", // Pink 100
            backgroundColor: "#FCE4EC",
        },
        {
            name: "Insurance",
            icon: GppGoodIcon,
            color: "#388E3C", // Dark Green
            backgroundColor: "#E8F5E9",
        },
        {
            name: "Taxes",
            icon: CasesIcon,
            color: "#795548", // Brown
            backgroundColor: "#F5F5F5",
        },
        {
            name: "Salon & Spa Services",
            icon: ContentCutIcon,
            color: "#9C27B0", // Purple
            backgroundColor: "#F3E5F5",
        },
        {
            name: "Gifts & Donations",
            icon: CardGiftcardIcon,
            color: "#FF4081", //Dark Pink
            backgroundColor: "#FCE4EC",
        },
        {
            name: "Laundry & Dry Cleaning",
            icon: LocalLaundryServiceIcon,
            color: "#303F9F", // Indigo Dark
            backgroundColor: "#E8EAF6",
        },
        {
            name: "Cosmetics & Makeup",
            icon: Face3Icon,
            color: "#FFAB91", //Light Orange
            backgroundColor: "#FBE9E7",
        },
        {
            name: "Pet Care",
            icon: PetsIcon,
            color: "#A1887F", //Brown
            backgroundColor: "#F5F5F5",
        },
        {
            name: "Purchase",
            icon: ShoppingBagIcon,
            color: "#8E24AA", //Dark Violet
            backgroundColor: "#F3E5F5",
        },
        {
            name: "Payments",
            icon: PaymentsIcon,
            color: "#1A237E", //Very Dark Blue
            backgroundColor: "#E0E0E0",
        },
        {
            name: "Other",
            icon: MoreHorizIcon,
            color: "#757575", // Grey
            backgroundColor: "#EEEEEE",
        },
    ];
}

export const columnHeaderOptions = ["Transaction Date", "Narration", "Notes", "Category", "Labels", "Bank", "Type", "Amount"];

export const commonTableHeadingStyles = (mode: string): { [key: string]: string | number } => {
    return {
        fontWeight: "bold",
        fontSize: "1rem",
        backgroundColor: mode === "dark" ? "#222126" : "#F6F5FF",
        color: "#8578e5",
        whiteSpace: "nowrap",
        textAlign: "center",
    };
};
