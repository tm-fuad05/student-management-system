import type { IconType } from "react-icons";
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineCreditCard,
  HiOutlineMagnifyingGlass,
  HiOutlineRectangleStack,
  HiOutlineUserGroup,
  HiOutlineViewColumns,
} from "react-icons/hi2";
import type { ModuleKey } from "./types";

export type NavItem = {
  href: string;
  label: string;
  key: ModuleKey;
  Icon: IconType;
};

export const APP_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard", Icon: HiOutlineViewColumns },
  {
    href: "/departments",
    label: "Departments",
    key: "departments",
    Icon: HiOutlineBuildingOffice2,
  },
  { href: "/students", label: "Students", key: "students", Icon: HiOutlineAcademicCap },
  { href: "/teachers", label: "Teachers", key: "teachers", Icon: HiOutlineUserGroup },
  { href: "/courses", label: "Courses", key: "courses", Icon: HiOutlineBookOpen },
  { href: "/semesters", label: "Semesters", key: "semesters", Icon: HiOutlineCalendarDays },
  { href: "/sections", label: "Sections", key: "sections", Icon: HiOutlineRectangleStack },
  {
    href: "/enrollments",
    label: "Enrollments",
    key: "enrollments",
    Icon: HiOutlineClipboardDocumentList,
  },
  {
    href: "/attendance",
    label: "Attendance",
    key: "attendance",
    Icon: HiOutlineClipboardDocumentCheck,
  },
  { href: "/results", label: "Results", key: "results", Icon: HiOutlineChartBar },
  { href: "/payments", label: "Payments", key: "payments", Icon: HiOutlineCreditCard },
  {
    href: "/reports",
    label: "Search & Reports",
    key: "reports",
    Icon: HiOutlineMagnifyingGlass,
  },
];
