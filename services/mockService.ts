
import { Clothe, Customer, Reservation, ClotheStatus, ReservationStatus, PaymentStatus, DashboardStats, CategoryRevenue } from '../types';

const STORAGE_KEYS = {
  CLOTHES: 'closet_clothes_v2',
  CUSTOMERS: 'closet_customers_v2',
  RESERVATIONS: 'closet_reservations_v2'
};

class ClosetService {
  private clothes: Clothe[] = [];
  private customers: Customer[] = [];
  private reservations: Reservation[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.clothes.length === 0) {
      this.initMockData();
    }
  }

  private loadFromStorage() {
    try {
      const savedClothes = localStorage.getItem(STORAGE_KEYS.CLOTHES);
      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const savedReservations = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);

      if (savedClothes) this.clothes = JSON.parse(savedClothes);
      if (savedCustomers) this.customers = JSON.parse(savedCustomers);
      if (savedReservations) this.reservations = JSON.parse(savedReservations);
    } catch (e) {
      // Falha ao carregar do localStorage
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.CLOTHES, JSON.stringify(this.clothes));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(this.customers));
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(this.reservations));
  }

  private initMockData() {
    this.clothes = [
      { id: '1', name: 'Vestido Gala Vermelho', category: 'Festa', size: 'M', measurements: { busto: '90cm', cintura: '70cm' }, status: ClotheStatus.AVAILABLE, rental_value: 450, deposit_value: 200, image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=400', rent_count: 12, history: [] },
      { id: '2', name: 'Terno Slim Blue', category: 'Terno', size: 'G', measurements: { ombro: '48cm', manga: '65cm' }, status: ClotheStatus.RESERVED, rental_value: 320, deposit_value: 150, image_url: 'https://images.unsplash.com/photo-1594932224828-b4b05a83296d?auto=format&fit=crop&q=80&w=400', rent_count: 8, history: [] },
      { id: '3', name: 'Vestido Noiva Sereia', category: 'Noiva', size: 'P', measurements: { busto: '85cm', quadril: '95cm' }, status: ClotheStatus.AVAILABLE, rental_value: 1500, deposit_value: 500, image_url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=400', rent_count: 5, history: [] },
    ];

    this.customers = [
      { id: 'c1', name: 'Maria Silva', document: '123.456.789-00', phone: '(11) 98888-7777', email: 'maria@example.com', is_recurring: true },
      { id: 'c2', name: 'João Oliveira', document: '987.654.321-11', phone: '(11) 97777-6666', email: 'joao@example.com', is_recurring: false },
    ];

    this.reservations = [
      {
        id: 'r1',
        clothe_id: '2',
        customer_id: 'c2',
        start_date: '2024-05-20',
        end_date: '2024-05-25',
        status: ReservationStatus.CONFIRMED,
        total_value: 320,
        deposit_value: 150,
        payment_status: PaymentStatus.PAID,
        clothe_ids: ['2']
      },
    ];
    this.saveToStorage();
  }

  private addHistory(clotheId: string, status: ClotheStatus, note: string) {
    this.clothes = this.clothes.map(c => {
      if (c.id === clotheId) {
        const history = c.history || [];
        return {
          ...c,
          status,
          history: [...history, { id: Math.random().toString(36).substr(2, 9), status, note, date: new Date().toISOString() }]
        };
      }
      return c;
    });
    this.saveToStorage();
  }

  async getClothes(): Promise<Clothe[]> {
    return [...this.clothes];
  }

  async addClothe(clothe: Clothe): Promise<Clothe> {
    const newClothe = {
      ...clothe,
      id: Math.random().toString(36).substr(2, 9),
      rent_count: 0,
      history: [],
      image_url: clothe.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'
    };
    this.clothes.push(newClothe);
    this.saveToStorage();
    return newClothe;
  }

  async updateClotheStatus(clotheId: string, status: ClotheStatus, note: string): Promise<void> {
    this.addHistory(clotheId, status, note);
  }

  async getCustomers(): Promise<Customer[]> {
    return [...this.customers];
  }

  async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const newCustomer = {
      ...customer,
      id: 'c' + Math.random().toString(36).substr(2, 9),
      is_recurring: false
    };
    this.customers.push(newCustomer);
    this.saveToStorage();
    return newCustomer;
  }

  checkAvailability(clotheId: string, start: string, end: string, excludeResId?: string): boolean {
    const requestedStart = new Date(start);
    const requestedEnd = new Date(end);

    const conflict = this.reservations.find(r => {
      if (r.clothe_id !== clotheId) return false;
      if (r.id === excludeResId) return false;

      const inactiveStatuses: ReservationStatus[] = [
        ReservationStatus.QUOTATION,
        ReservationStatus.CANCELLED,
        ReservationStatus.RETURNED
      ];

      if (inactiveStatuses.includes(r.status)) return false;

      const rStart = new Date(r.start_date);
      const rEnd = new Date(r.end_date);
      return (requestedStart <= rEnd && requestedEnd >= rStart);
    });

    return !conflict;
  }

  async getReservations(): Promise<Reservation[]> {
    return this.reservations.map(r => ({
      ...r,
      clothe: this.clothes.find(c => c.id === r.clothe_id),
      customer: this.customers.find(c => c.id === r.customer_id)
    }));
  }

  async addReservation(res: Omit<Reservation, 'id'>): Promise<Reservation> {
    if (res.status !== ReservationStatus.QUOTATION) {
      const available = this.checkAvailability(res.clothe_id, res.start_date, res.end_date);
      if (!available) throw new Error('A peça já está reservada para este período.');
    }

    const newRes = { ...res, id: Math.random().toString(36).substr(2, 9), contract_url: '#' };
    this.reservations.push(newRes);

    if (res.status === ReservationStatus.CONFIRMED) {
      this.addHistory(res.clothe_id, ClotheStatus.RESERVED, `Reserva confirmada #${newRes.id}`);
    }
    this.saveToStorage();
    return newRes;
  }

  async convertQuotation(id: string): Promise<Reservation> {
    const res = this.reservations.find(r => r.id === id);
    if (!res) throw new Error('Orçamento não encontrado');

    const available = this.checkAvailability(res.clothe_id, res.start_date, res.end_date);
    if (!available) throw new Error('Peça não disponível para as datas solicitadas.');

    res.status = ReservationStatus.CONFIRMED;
    this.addHistory(res.clothe_id, ClotheStatus.RESERVED, `Orçamento convertido em reserva #${id}`);
    this.saveToStorage();
    return res;
  }

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const res = this.reservations.find(r => r.id === id);
    if (!res) throw new Error('Reserva não encontrada');

    res.status = status;

    if (status === ReservationStatus.PICKED_UP) {
      this.addHistory(res.clothe_id, ClotheStatus.OUT, `Peça retirada - Reserva #${id}`);
      this.clothes = this.clothes.map(c => c.id === res.clothe_id ? { ...c, rent_count: (c.rent_count || 0) + 1 } : c);
    } else if (status === ReservationStatus.RETURNED) {
      this.addHistory(res.clothe_id, ClotheStatus.LAUNDRY, `Peça devolvida (Lavanderia) - Reserva #${id}`);
    } else if (status === ReservationStatus.CANCELLED) {
      this.addHistory(res.clothe_id, ClotheStatus.AVAILABLE, `Reserva #${id} cancelada`);
    }

    this.saveToStorage();
    return res;
  }

  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const active = this.reservations.filter(r => r.status === ReservationStatus.CONFIRMED || r.status === ReservationStatus.PICKED_UP);
    const revenue = this.reservations
      .filter(r => r.payment_status === PaymentStatus.PAID)
      .reduce((acc, r) => acc + (r.total_value || 0), 0);

    const revenueByCategory: CategoryRevenue[] = Array.from(
      this.reservations.reduce((acc, r) => {
        const cat = this.clothes.find(c => c.id === r.clothe_id)?.category || 'Outros';
        acc.set(cat, (acc.get(cat) || 0) + (r.total_value || 0));
        return acc;
      }, new Map<string, number>())
    ).map(([category, value]) => ({ category, value }));

    return {
      totalClothes: this.clothes.length,
      activeReservations: active.length,
      upcomingReturns: this.reservations.filter(r => r.status === ReservationStatus.PICKED_UP && new Date(r.end_date) <= now).length,
      monthlyRevenue: revenue,
      contractedRevenue: revenue, // Mock simplificado
      futureReservations: this.reservations.filter(r => new Date(r.start_date) > now && r.status === ReservationStatus.CONFIRMED).length,
      mostRented: [...this.clothes].sort((a, b) => (b.rent_count || 0) - (a.rent_count || 0)).slice(0, 3),
      occupancyRate: this.clothes.length > 0 ? (active.length / this.clothes.length) * 100 : 0,
      revenueByCategory,
      recurringCustomersCount: this.customers.filter(c => c.is_recurring).length
    };
  }
}

export const mockService = new ClosetService();
