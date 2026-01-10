
import { supabase } from './supabaseClient';
import {
    Clothe, Customer, Reservation, ClotheStatus,
    ReservationStatus, PaymentStatus, DashboardStats, RecentActivity
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

    async deleteClothe(id: string): Promise<void> {
        const { error } = await supabase
            .from('clothes')
            .delete()
            .eq('id', id);

        if (error) throw error;
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

    async importClothes(clothes: Omit<Clothe, 'id' | 'rent_count' | 'history'>[]): Promise<void> {
        const clothesToInsert = clothes.map(clothe => ({
            ...clothe,
            rent_count: 0,
            history: [],
            image_url: clothe.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400',
            images: clothe.images || []
        }));

        const { error } = await supabase
            .from('clothes')
            .insert(clothesToInsert);

        if (error) throw error;
    }

    async getCustomers(): Promise<Customer[]> {
        const { data, error } = await supabase
            .from('customers')
            .select('*, reservations(count)')
            .order('name');

        if (error) throw error;

        return data.map((c: any) => ({
            ...c,
            reservations_count: c.reservations?.[0]?.count || 0
        })) as Customer[];
    }

    async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
        const { data, error } = await supabase
            .from('customers')
            .insert([{
                ...customer,
                is_recurring: false,
                status: customer.status || 'ativo'
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Customer;
    }

    async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
        const { data, error } = await supabase
            .from('customers')
            .update(customer)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Customer;
    }

    async deleteCustomer(id: string): Promise<void> {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getReservations(): Promise<Reservation[]> {
        const { data, error } = await supabase
            .from('reservations')
            .select(`
                *,
                customer:customers(*),
                items:reservation_items(
                    size,
                    clothe:clothes(*)
                )
            `)
            .order('start_date', { ascending: false });

        if (error) throw error;

        // Mapear estrutura aninhada para facilitar o uso no front
        return (data as any[]).map(res => {
            const itemSizes: Record<string, string> = {};
            res.items?.forEach((i: any) => {
                if (i.clothe?.id) {
                    itemSizes[i.clothe.id] = i.size || i.clothe.size;
                }
            });

            return {
                ...res,
                clothes: res.items?.map((i: any) => i.clothe).filter(Boolean) || [],
                item_sizes: itemSizes
            };
        }) as Reservation[];
    }

    async addReservation(res: Omit<Reservation, 'id'>): Promise<Reservation> {
        // IDs das roupas vêm do clothe_ids no res
        const clothIds = res.clothe_ids || [];

        // Verificação de disponibilidade para cada peça
        if (res.status !== ReservationStatus.QUOTATION) {
            for (const id of clothIds) {
                const isAvailable = await this.checkAvailability(id, res.start_date, res.end_date);
                if (!isAvailable) throw new Error(`Uma das peças (ID: ${id}) não está disponível para este período.`);
            }
        }

        // 1. Criar a reserva principal
        const { clothe_ids, clothes, item_sizes, ...resData } = res as any;

        // REGRA AUTOMÁTICA: Ao criar, o valor pago inicial é o valor do Sinal (Caução/Entrada)
        // Se estiver marcado como PAGO TOTAL, então é o valor total. Caso contrário, é só o sinal.
        const initialPayment = resData.payment_status === PaymentStatus.PAID
            ? resData.total_value
            : (resData.deposit_value || 0);

        const { data: reservation, error: resError } = await supabase
            .from('reservations')
            .insert([{ ...resData, amount_paid: initialPayment }])
            .select()
            .single();

        if (resError) throw resError;

        // 2. Criar os itens da reserva
        if (clothIds.length > 0) {
            const items = clothIds.map(clothe_id => ({
                reservation_id: reservation.id,
                clothe_id,
                size: item_sizes?.[clothe_id] // Agora gravando o tamanho selecionado!
            }));
            const { error: itemsError } = await supabase
                .from('reservation_items')
                .insert(items);

            if (itemsError) throw itemsError;

            // 3. Atualizar status das roupas se confirmado
            if (reservation.status === ReservationStatus.CONFIRMED) {
                for (const id of clothIds) {
                    await this.updateClotheStatus(id, ClotheStatus.RESERVED, `Reserva confirmada #${reservation.id}`);
                }
            }
        }

        return this.getReservationById(reservation.id);
    }

    async getReservationById(id: string): Promise<Reservation> {
        const { data, error } = await supabase
            .from('reservations')
            .select(`
                *,
                customer:customers(*),
                items:reservation_items(
                    size,
                    clothe:clothes(*)
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        const itemSizes: Record<string, string> = {};
        data.items?.forEach((i: any) => {
            if (i.clothe?.id) {
                itemSizes[i.clothe.id] = i.size || i.clothe.size;
            }
        });

        return {
            ...data,
            clothes: (data as any).items?.map((i: any) => i.clothe).filter(Boolean) || [],
            item_sizes: itemSizes
        } as Reservation;
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
        return data.length === 0;
    }

    async convertQuotation(id: string): Promise<Reservation> {
        const res = await this.getReservationById(id);
        const clothIds = res.clothes?.map(c => c.id) || [];

        for (const clotheId of clothIds) {
            const isAvailable = await this.checkAvailability(clotheId, res.start_date, res.end_date);
            if (!isAvailable) throw new Error(`Peça ${clotheId} não disponível para as datas solicitadas.`);
        }

        const { data, error: updateError } = await supabase
            .from('reservations')
            .update({ status: ReservationStatus.CONFIRMED })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        for (const clotheId of clothIds) {
            await this.updateClotheStatus(clotheId, ClotheStatus.RESERVED, `Orçamento convertido em reserva #${id}`);
        }

        return this.getReservationById(id);
    }

    async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
        const res = await this.getReservationById(id);
        const clothIds = res.clothes?.map(c => c.id) || [];

        const updates: any = { status };

        // REGRA AUTOMÁTICA: Check-in de devolução = Caixa realizado
        if (status === ReservationStatus.RETURNED) {
            updates.payment_status = PaymentStatus.PAID;
            // Quitamos o valor total se ainda não foi pago integralmente
            if ((res.amount_paid || 0) < res.total_value) {
                updates.amount_paid = res.total_value;
            }
        }

        const { data, error: updateError } = await supabase
            .from('reservations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        for (const clotheId of clothIds) {
            if (status === ReservationStatus.PICKED_UP) {
                await this.updateClotheStatus(clotheId, ClotheStatus.OUT, `Peça retirada - Reserva #${id}`);
                // Incrementar rent_count
                const { data: clothe } = await supabase.from('clothes').select('rent_count').eq('id', clotheId).single();
                await supabase.from('clothes').update({ rent_count: (clothe?.rent_count || 0) + 1 }).eq('id', clotheId);
            } else if (status === ReservationStatus.RETURNED) {
                // Atualizar status para lavanderia. O cliente DEVE inspecionar depois.
                // Mas aqui já liberamos a reserva.
                await this.updateClotheStatus(clotheId, ClotheStatus.LAUNDRY, `Peça devolvida (Lavanderia) - Reserva #${id}`);
            } else if (status === ReservationStatus.CANCELLED) {
                await this.updateClotheStatus(clotheId, ClotheStatus.AVAILABLE, `Reserva #${id} cancelada`);
            }
        }

        return this.getReservationById(id);
    }

    async recordPayment(id: string, amount: number): Promise<void> {
        const { data: res, error: fetchError } = await supabase
            .from('reservations')
            .select('amount_paid, total_value')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const newAmount = (Number(res.amount_paid) || 0) + amount;
        const payment_status = newAmount >= res.total_value ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

        const { error } = await supabase
            .from('reservations')
            .update({
                amount_paid: newAmount,
                payment_status
            })
            .eq('id', id);

        if (error) throw error;
    }

    async updateProjection(monthYear: string, expectedValue: number): Promise<void> {
        const { error } = await supabase
            .from('projections')
            .upsert({
                month_year: monthYear,
                expected_value: expectedValue
            }, { onConflict: 'month_year' });

        if (error) throw error;
    }

    async getStats(): Promise<DashboardStats> {
        const now = new Date().toISOString().split('T')[0];
        const currentMonthKey = new Date().toISOString().slice(0, 7);

        const [
            { data: allClothes },
            { data: allRes },
            { count: recurringCustomers },
            { data: latestReservations }
        ] = await Promise.all([
            supabase.from('clothes').select('*'),
            supabase.from('reservations').select('*, customer:customers(name)'),
            supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_recurring', true),
            supabase.from('reservations')
                .select('*, customer:customers(name)')
                .order('created_at', { ascending: false })
                .limit(10)
        ]);

        const activeRes = allRes?.filter(r => [ReservationStatus.CONFIRMED, ReservationStatus.PICKED_UP].includes(r.status as ReservationStatus)) || [];

        // Receita em Caixa (do mês atual)
        const monthlyRevenue = allRes
            ?.filter(r => r.created_at && r.created_at.startsWith(currentMonthKey))
            .reduce((acc, r) => acc + (Number(r.amount_paid) || 0), 0) || 0;

        const contractedRevenue = allRes
            ?.filter(r => [ReservationStatus.CONFIRMED, ReservationStatus.PICKED_UP, ReservationStatus.RETURNED].includes(r.status as ReservationStatus))
            .reduce((acc, r) => acc + (Number(r.total_value) || 0), 0) || 0;

        const futureReservations = allRes
            ?.filter(r => r.start_date > now && r.status === ReservationStatus.CONFIRMED)
            .length || 0;

        const upcomingReturns = allRes
            ?.filter(r => r.status === ReservationStatus.PICKED_UP && r.end_date <= now)
            .length || 0;

        const pendingPaymentsCount = allRes
            ?.filter(r => r.status !== ReservationStatus.CANCELLED && r.status !== ReservationStatus.QUOTATION && (Number(r.amount_paid) || 0) < Number(r.total_value))
            .length || 0;

        const itemsInLaundryCount = allClothes?.filter(c => c.status === ClotheStatus.LAUNDRY).length || 0;
        const itemsInMaintenanceCount = allClothes?.filter(c => c.status === ClotheStatus.MAINTENANCE).length || 0;

        // Atividades Recentes
        const recentActivities: RecentActivity[] = (latestReservations || []).map(r => ({
            id: r.id,
            type: r.status === ReservationStatus.RETURNED ? 'return' : (r.status === ReservationStatus.CONFIRMED ? 'reservation' : 'payment'),
            customerName: r.customer?.name || 'Cliente',
            description: r.status === ReservationStatus.RETURNED
                ? 'Devolução de traje realizada'
                : (r.status === ReservationStatus.CONFIRMED ? 'Nova reserva confirmada' : 'Atualização de status de reserva'),
            time: r.created_at ? new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'
        }));

        // Revenue by Category (more accurate now)
        const revenueByCategory = Array.from(
            (allRes || []).reduce((acc, r) => {
                // Se a reserva tiver clothe_ids (array), pegamos a categoria da primeira peça para simplificar estatística por "tipo de contrato"
                const firstClotheId = r.clothe_ids?.[0] || r.clothe_id;
                const clothe = allClothes?.find(c => c.id === firstClotheId);
                const cat = clothe?.category || 'Outros';
                acc.set(cat, (acc.get(cat) || 0) + (Number(r.total_value) || 0));
                return acc;
            }, new Map<string, number>())
        ).map(([category, value]) => ({ category, value }));

        const mostRented = [...(allClothes || [])]
            .sort((a, b) => (b.rent_count || 0) - (a.rent_count || 0))
            .slice(0, 3);

        // Calcular Histórico Mensal (últimos 6 meses)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return {
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
            };
        });

        const { data: projections } = await supabase
            .from('projections')
            .select('*')
            .in('month_year', last6Months.map(m => m.key));

        const monthlyHistory = last6Months.map(m => {
            const monthRevenue = allRes
                ?.filter(r => r.created_at && r.created_at.startsWith(m.key))
                .reduce((acc, r) => acc + (Number(r.amount_paid) || 0), 0) || 0;

            const projection = projections?.find(p => p.month_year === m.key)?.expected_value || 0;

            return {
                name: m.label.charAt(0).toUpperCase() + m.label.slice(1),
                revenue: monthRevenue,
                projection: Number(projection)
            };
        });

        const pendingReservations = allRes?.filter(r =>
            r.status !== ReservationStatus.CANCELLED &&
            r.status !== ReservationStatus.QUOTATION &&
            (Number(r.amount_paid) || 0) < Number(r.total_value)
        ) || [];

        return {
            totalClothes: allClothes?.length || 0,
            activeReservations: activeRes.length,
            upcomingReturns,
            monthlyRevenue,
            contractedRevenue,
            futureReservations,
            mostRented,
            occupancyRate: allClothes?.length ? (activeRes.length / allClothes.length) * 100 : 0,
            revenueByCategory,
            recurringCustomersCount: recurringCustomers || 0,
            monthlyHistory,
            recentActivities,
            pendingPaymentsCount: pendingReservations.length,
            pendingReservations: pendingReservations as Reservation[],
            itemsInLaundryCount,
            itemsInMaintenanceCount
        };
    }
}

export const supabaseService = new SupabaseService();
