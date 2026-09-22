/**
 * IDEaS Icon Wrapper — semua icon dari lucide-react
 * Radius & style konsisten, warna diatur oleh parent (currentColor)
 */

import {
  // General
  Calendar,
  Users,
  ClipboardList,
  BookOpen,
  FileText,
  Settings,
  Shield,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  MoreHorizontal,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  ChevronUp,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Command,
  Package,
  Tag,
  Award,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lamp,
  Smile,
  Sword,
  Zap,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudOff,
  Snowflake,
  Flame,
  Droplets,
  Wind,
} from "lucide-react";

export const Icon = ({
  name,
  size = 18,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) => {
  const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    calendar: Calendar,
    users: Users,
    clipboard: ClipboardList,
    book: BookOpen,
    file: FileText,
    settings: Settings,
    shield: Shield,
    bell: Bell,
    search: Search,
    plus: Plus,
    edit: Edit,
    trash: Trash2,
    eye: Eye,
    eyeOff: EyeOff,
    download: Download,
    upload: Upload,
    moreHorizontal: MoreHorizontal,
    moreVertical: MoreVertical,
    chevronDown: ChevronDown,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    x: X,
    check: Check,
    alertCircle: AlertCircle,
    info: Info,
    trendingUp: TrendingUp,
    trendingDown: TrendingDown,
    activity: Activity,
    barChart: BarChart3,
    pieChart: PieChart,
    arrowUp: ArrowUp,
    arrowDown: ArrowDown,
    externalLink: ExternalLink,
    mail: Mail,
    phone: Phone,
    mapPin: MapPin,
    clock: Clock,
    filter: Filter,
    sortAsc: SortAsc,
    sortDesc: SortDesc,
    grid: Grid,
    list: List,
    chevronUp: ChevronUp,
    home: Home,
    logOut: LogOut,
    menu: Menu,
    panelLeftClose: PanelLeftClose,
    panelLeft: PanelLeft,
    command: Command,
    package: Package,
    tag: Tag,
    award: Award,
    star: Star,
    heart: Heart,
    thumbsUp: ThumbsUp,
    thumbsDown: ThumbsDown,
    messageSquare: MessageSquare,
    lamp: Lamp,
    smile: Smile,
    sword: Sword,
    zap: Zap,
    wifi: Wifi,
    wifiOff: WifiOff,
    sun: Sun,
    moon: Moon,
    cloud: Cloud,
    cloudRain: CloudRain,
    cloudLightning: CloudLightning,
    cloudOff: CloudOff,
    snowflake: Snowflake,
    flame: Flame,
    droplets: Droplets,
    wind: Wind,
  };

  const IconComponent = icons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in IDEaS Icon registry`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
};

/** Icon khusus untuk card header — di render di dalam icon-box */
export const CardIcon = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => (
  <Icon name={name} size={18} className={`text-gray-500 dark:text-gray-400 ${className}`} />
);

export default Icon;
