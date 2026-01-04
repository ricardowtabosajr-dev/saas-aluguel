
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export enum ClotheStatus {
  AVAILABLE = 'disponivel',
  RESERVED = 'reservado',
  MAINTENANCE = 'manutencao',
  LAUNDRY = 'lavanderia',
  OUT = 'em_uso'
}

export enum ReservationStatus {
  QUOTATION = 'orcamento',
  CONFIRMED = 'confirmada',
  PICKED_UP = 'retirada',
  RETURNED = 'devolvida',
  CANCELLED = 'cancelada'
}

export enum PaymentStatus {
  PENDING = 'pendente',
  PARTIAL = 'parcial',
  PAID = 'pago'
}

export interface ClotheHistory {
  id: string;
  status: ClotheStatus;
  date: string;
  note: string;
}

export interface Clothe {
  id: string;
  name: string;
  category: string;
  size: string;
  measurements: Record<string, string>;
  status: ClotheStatus;
  rental_value: number;
  deposit_value: number;
  image_url?: string;
  rent_count: number;
  history?: ClotheHistory[];
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  is_recurring?: boolean;
}

export interface Reservation {
  id: string;
  clothe_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  total_value: number;
  deposit_value: number;
  payment_status: PaymentStatus;
  clothe?: Clothe;
  customer?: Customer;
  contract_url?: string;
}

export interface CategoryRevenue {
  category: string;
  value: number;
}

export interface DashboardStats {
  totalClothes: number;
  activeReservations: number;
  upcomingReturns: number;
  monthlyRevenue: number;
  futureReservations: number;
  mostRented: Clothe[];
  occupancyRate: number;
  revenueByCategory: CategoryRevenue[];
  recurringCustomersCount: number;
}
