/** Shared API types, mirroring the NestJS response DTOs. */

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: User;
}

export interface Donor {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DonorDonationHistoryItem {
  id: string;
  amount: number;
  donationDate: string;
  notes: string | null;
  createdAt: string;
}

export type BeneficiaryCategory = 'FOOD' | 'EDUCATION' | 'MEDICAL';
export type BeneficiaryStatus = 'ACTIVE' | 'INACTIVE';

export const BENEFICIARY_CATEGORIES: readonly BeneficiaryCategory[] = [
  'FOOD',
  'EDUCATION',
  'MEDICAL',
];

export const BENEFICIARY_STATUSES: readonly BeneficiaryStatus[] = ['ACTIVE', 'INACTIVE'];

export interface Beneficiary {
  id: string;
  fullName: string;
  phone: string | null;
  category: BeneficiaryCategory;
  status: BeneficiaryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DonationDonor {
  id: string;
  fullName: string;
  email: string | null;
}

export interface Donation {
  id: string;
  donor: DonationDonor;
  amount: number;
  donationDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalDonors: number;
  totalDonationAmount: number;
  activeBeneficiaries: number;
  totalDonations: number;
}

export interface RecentDonation {
  id: string;
  amount: number;
  donationDate: string;
  donorName: string;
  donorEmail: string | null;
  notes: string | null;
}

export interface BeneficiaryBreakdownItem {
  category: BeneficiaryCategory;
  status: BeneficiaryStatus;
  count: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentDonations: RecentDonation[];
  beneficiaryBreakdown: BeneficiaryBreakdownItem[];
}

export interface DonationSummary {
  totalDonations: number;
  totalAmount: number;
  averageAmount: number;
  largestDonation: number;
  uniqueDonors: number;
}

export interface MonthlyTotal {
  month: string;
  label: string;
  totalDonations: number;
  totalAmount: number;
}

export interface DonorTotal {
  donorId: string;
  donorName: string;
  totalDonations: number;
  totalAmount: number;
}

export interface DonationReport {
  period: { from: string | null; to: string | null };
  summary: DonationSummary;
  monthlyTotals: MonthlyTotal[];
  topDonors: DonorTotal[];
  donations: Donation[];
}

/** Error payload produced by the backend's global exception filter. */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  method: string;
  timestamp: string;
  errors?: string[];
}

/** Query parameters accepted by every paginated list endpoint. */
export interface ListParams {
  page?: number;
  pageSize?: number;
}

export interface DonorListParams extends ListParams {
  search?: string;
}

export interface BeneficiaryListParams extends ListParams {
  search?: string;
  category?: BeneficiaryCategory;
  status?: BeneficiaryStatus;
}

export interface DonationListParams extends ListParams {
  search?: string;
  donorId?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ReportParams extends ListParams {
  from?: string;
  to?: string;
  year?: string;
  search?: string;
}
