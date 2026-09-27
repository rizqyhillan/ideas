/**
 * IDEaS Icon Wrapper — semua icon dari lucide-react
 * Radius & style konsisten, warna diatur oleh parent (currentColor)
 */

import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

// Alias custom map to standard Lucide names
const ALIAS_MAP: Record<string, string> = {
  home: "Home",
  dashboard: "LayoutDashboard",
  calendar: "Calendar",
  users: "Users",
  user: "User",
  school: "School",
  book: "BookOpen",
  bookopen: "BookOpen",
  bookOpen: "BookOpen",
  clipboard: "ClipboardList",
  clipboardlist: "ClipboardList",
  settings: "Settings",
  shield: "Shield",
  bell: "Bell",
  search: "Search",
  plus: "Plus",
  edit: "Edit",
  trash: "Trash2",
  trash2: "Trash2",
  eye: "Eye",
  eyeoff: "EyeOff",
  eyeOff: "EyeOff",
  download: "Download",
  upload: "Upload",
  morehorizontal: "MoreHorizontal",
  moreHorizontal: "MoreHorizontal",
  dotshorizontal: "MoreHorizontal",
  dotsHorizontal: "MoreHorizontal",
  morevertical: "MoreVertical",
  moreVertical: "MoreVertical",
  chevrondown: "ChevronDown",
  chevronDown: "ChevronDown",
  chevronleft: "ChevronLeft",
  chevronLeft: "ChevronLeft",
  chevronright: "ChevronRight",
  chevronRight: "ChevronRight",
  chevronup: "ChevronUp",
  chevronUp: "ChevronUp",
  x: "X",
  close: "X",
  check: "Check",
  checkcircle: "CheckCircle",
  alertcircle: "AlertCircle",
  alerttriangle: "AlertTriangle",
  info: "Info",
  trendingup: "TrendingUp",
  trendingdown: "TrendingDown",
  activity: "Activity",
  barchart: "BarChart3",
  barchart3: "BarChart3",
  piechart: "PieChart",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  externallink: "ExternalLink",
  mail: "Mail",
  phone: "Phone",
  mappin: "MapPin",
  clock: "Clock",
  filter: "Filter",
  sortasc: "SortAsc",
  sortdesc: "SortDesc",
  grid: "Grid",
  list: "List",
  logout: "LogOut",
  logOut: "LogOut",
  menu: "Menu",
  command: "Command",
  package: "Package",
  tag: "Tag",
  award: "Award",
  star: "Star",
  heart: "Heart",
  graduationcap: "GraduationCap",
  graduationCap: "GraduationCap",
  GraduationCap: "GraduationCap",
  brain: "Brain",
  Brain: "Brain",
  lock: "Lock",
  unlock: "Unlock",
  refresh: "RefreshCw",
  refreshcw: "RefreshCw",
};

export interface IconProps extends Omit<LucideProps, "ref"> {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  className = "",
  ...props
}) => {
  if (!name) return null;

  // 1. Check alias map first
  const mappedName = ALIAS_MAP[name] || ALIAS_MAP[name.toLowerCase()] || name;

  // 2. Try exact mapped name
  let Component = (LucideIcons as Record<string, any>)[mappedName];

  // 3. Try PascalCase conversion (e.g. 'book-open' -> 'BookOpen', 'calendar' -> 'Calendar')
  if (!Component) {
    const pascalName = name
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (c) => c.toUpperCase());
    Component = (LucideIcons as Record<string, any>)[pascalName];
  }

  // 4. Case-insensitive search across all exported Lucide icons
  if (!Component) {
    const lowerName = name.toLowerCase().replace(/[-_]/g, "");
    const matchingKey = Object.keys(LucideIcons).find(
      (key) => key.toLowerCase() === lowerName
    );
    if (matchingKey) {
      Component = (LucideIcons as Record<string, any>)[matchingKey];
    }
  }

  // 5. Fallback if still not found
  if (!Component || (typeof Component !== "function" && typeof Component !== "object")) {
    const Fallback = (LucideIcons as any).HelpCircle || (LucideIcons as any).Circle;
    if (Fallback) {
      return <Fallback size={size} className={className} {...props} />;
    }
    return null;
  }

  return <Component size={size} className={className} {...props} />;
};

export const CardIcon: React.FC<IconProps> = ({
  name,
  size = 18,
  className = "",
  ...props
}) => (
  <Icon
    name={name}
    size={size}
    className={`text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  />
);

export default Icon;
