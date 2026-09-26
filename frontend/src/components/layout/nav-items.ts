import {
  LayoutDashboard,
  Receipt,
  Users,
  UsersRound,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/** Primary navigation, in the order it appears in the sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/donors', label: 'Donors', icon: UsersRound },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: Users },
  { to: '/donations', label: 'Donations', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];
