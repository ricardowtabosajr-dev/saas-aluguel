
import { supabase } from './supabaseClient';
import {
    Clothe, Customer, Reservation, ClotheStatus,
    ReservationStatus, PaymentStatus, DashboardStats
} from '../types';

class SupabaseService {
    async getClothes(): Promise<Clothe[]> {
        const { data, error } = await supabase
            .from('clothes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Clothe[];
    }

    async addClothe(clothe: Omit<Clothe, 'id' | 'rent_count' | 'history'>): Promise<Clothe> {
        const { data, error } = await supabase
            .from('clothes')
            .insert([{
                ...clothe,
                rent_count: 0,
                history: [],
                image_url: clothe.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400',
                images: clothe.images || []
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Clothe;
    }

    async updateClothe(id: string, clothe: Partial<Clothe>): Promise<Clothe> {
        const { data, error } = await supabase
            .from('clothes')
            .update(clothe)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Clothe;
    }

    async uploadClotheImage(id: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${id}-${Math.random()}.${fileExt}`;
        const filePath = `clothes/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('clothes')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('clothes')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }


    async updateClotheStatus(clotheId: string, status: ClotheStatus, note: string): Promise<void> {
        // Primeiro pegamos o histórico atual
        const { data: clothe, error: fetchError } = await supabase
            .from('clothes')
            .select('history')
            .eq('id', clotheId)
            .single();

        if (fetchError) throw fetchError;

        const newHistoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            status,
            note,
            date: new Date().toISOString()
        };

        const updatedHistory = [...(clothe.history || []), newHistoryItem];

        const { error: updateError } = await supabase
            .from('clothes')
            .update({ status, history: updatedHistory })
            .eq('id', clotheId);

        if (updateError) throw updateError;
    }

    async getCustomers(): Promise<Customer[]> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Customer[];
    }

    async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
        const { data, error } = await supabase
            .from('customers')
            .insert([{ ...customer, is_recurring: false }])
            .select()
            .single();

        if (error) throw error;
        return data as Customer;
    }

    async getReservations(): Promise<Reservation[]> {
        const { data, error } = await supabase
            .from('reservations')
            .select(`
        *,
        clothe:clothes(*),
        customer:customers(*)
      `)
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data as Reservation[];
    }

    async addReservation(res: Omit<Reservation, 'id'>): Promise<Reservation> {
        // Verificação de disponibilidade se não for apenas orçamento
        if (res.status !== ReservationStatus.QUOTATION) {
            const isAvailable = await this.checkAvailability(res.clothe_id, res.start_date, res.end_date);
            if (!isAvailable) throw new Error('A peça já está reservada para este período.');
        }

        const { data, error } = await supabase
            .from('reservations')
            .insert([res])
            .select(`
        *,
        clothe:clothes(*),
        customer:customers(*)
      `)
            .single();

        if (error) throw error;

        if (data.status === ReservationStatus.CONFIRMED) {
            await this.updateClotheStatus(data.clothe_id, ClotheStatus.RESERVED, `Reserva confirmada #${data.id}`);
        }

        return data as Reservation;
    }

    async checkAvailability(clotheId: string, start: string, end: string, excludeResId?: string): Promise<boolean> {
        let query = supabase
            .from('reservations')
            .select('id')
            .eq('clothe_id', clotheId)
            .not('status', 'in', `("${ReservationStatus.QUOTATION}","${ReservationStatus.CANCELLED}","${ReservationStatus.RETURNED}")`)
            .lte('start_date', end)
            .gte('end_date', start);

        if (excludeResId) {
            query = query.neq('id', excludeResId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.length === 0;
    }

    async convertQuotation(id: string): Promise<Reservation> {
        const { data: res, error: fetchError } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const isAvailable = await this.checkAvailability(res.clothe_id, res.start_date, res.end_date);
        if (!isAvailable) throw new Error('Peça não disponível para as datas solicitadas.');

        const { data, error: updateError } = await supabase
            .from('reservations')
            .update({ status: ReservationStatus.CONFIRMED })
            .eq('id', id)
            .select(`
        *,
        clothe:clothes(*),
        customer:customers(*)
      `)
            .single();

        if (updateError) throw updateError;

        await this.updateClotheStatus(data.clothe_id, ClotheStatus.RESERVED, `Orçamento convertido em reserva #${id}`);

        return data as Reservation;
    }

    async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
        const { data: res, error: fetchError } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const { data, error: updateError } = await supabase
            .from('reservations')
            .update({ status })
            .eq('id', id)
            .select(`
        *,
        clothe:clothes(*),
        customer:customers(*)
      `)
            .single();

        if (updateError) throw updateError;

        if (status === ReservationStatus.PICKED_UP) {
            await this.updateClotheStatus(data.clothe_id, ClotheStatus.OUT, `Peça retirada - Reserva #${id}`);
            // Incrementar rent_count
            const { data: clothe } = await supabase.from('clothes').select('rent_count').eq('id', data.clothe_id).single();
            await supabase.from('clothes').update({ rent_count: (clothe?.rent_count || 0) + 1 }).eq('id', data.clothe_id);
        } else if (status === ReservationStatus.RETURNED) {
            await this.updateClotheStatus(data.clothe_id, ClotheStatus.LAUNDRY, `Peça devolvida (Lavanderia) - Reserva #${id}`);
        } else if (status === ReservationStatus.CANCELLED) {
            await this.updateClotheStatus(data.clothe_id, ClotheStatus.AVAILABLE, `Reserva #${id} cancelada`);
        }

        return data as Reservation;
    }

    async getStats(): Promise<DashboardStats> {
        const now = new Date().toISOString().split('T')[0];

        const [
            { count: totalClothes },
            { data: activeRes },
            { data: allRes },
            { count: recurringCustomers }
        ] = await Promise.all([
            supabase.from('clothes').select('*', { count: 'exact', head: true }),
            supabase.from('reservations').select('*').in('status', [ReservationStatus.CONFIRMED, ReservationStatus.PICKED_UP]),
            supabase.from('reservations').select('*, clothe:clothes(category)'),
            supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_recurring', true)
        ]);

        const monthlyRevenue = allRes
            ?.filter(r => r.payment_status === PaymentStatus.PAID)
            .reduce((acc, r) => acc + (Number(r.total_value) || 0), 0) || 0;

        const futureReservations = allRes
            ?.filter(r => r.start_date > now && r.status === ReservationStatus.CONFIRMED)
            .length || 0;

        const upcomingReturns = allRes
            ?.filter(r => r.status === ReservationStatus.PICKED_UP && r.end_date <= now)
            .length || 0;

        const revenueByCategory = Array.from(
            (allRes || []).reduce((acc, r) => {
                const cat = r.clothe?.category || 'Outros';
                acc.set(cat, (acc.get(cat) || 0) + (Number(r.total_value) || 0));
                return acc;
            }, new Map<string, number>())
        ).map(([category, value]) => ({ category, value }));

        const { data: mostRented } = await supabase
            .from('clothes')
            .select('*')
            .order('rent_count', { ascending: false })
            .limit(3);

        return {
            totalClothes: totalClothes || 0,
            activeReservations: activeRes?.length || 0,
            upcomingReturns,
            monthlyRevenue,
            futureReservations,
            mostRented: (mostRented as Clothe[]) || [],
            occupancyRate: totalClothes ? ((activeRes?.length || 0) / totalClothes) * 100 : 0,
            revenueByCategory,
            recurringCustomersCount: recurringCustomers || 0
        };
    }
}

export const supabaseService = new SupabaseService();
