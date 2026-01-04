import { useState, useEffect, useCallback } from 'react';
import { Reservation, ReservationStatus } from '../types';
import { supabaseService } from '../services/supabaseService';

export const useReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supabaseService.getReservations();
            setReservations(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar aluguéis.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const addReservation = async (reservation: Omit<Reservation, 'id'>) => {
        try {
            const newRes = await supabaseService.addReservation(reservation);
            setReservations(prev => [newRes, ...prev]);
            return newRes;
        } catch (err: any) {
            console.error(err);
            throw new Error(err.message || 'Erro ao criar reserva.');
        }
    };

    const updateReservationStatus = async (id: string, status: ReservationStatus) => {
        try {
            const updatedRes = await supabaseService.updateReservationStatus(id, status);
            setReservations(prev => prev.map(r => r.id === id ? updatedRes : r));
            return updatedRes;
        } catch (err: any) {
            console.error(err);
            throw new Error(err.message || 'Erro ao atualizar status.');
        }
    };

    const convertQuotation = async (id: string) => {
        try {
            const updatedRes = await supabaseService.convertQuotation(id);
            setReservations(prev => prev.map(r => r.id === id ? updatedRes : r));
            return updatedRes;
        } catch (err: any) {
            console.error(err);
            throw new Error(err.message || 'Erro ao converter orçamento.');
        }
    };

    const checkAvailability = async (clotheId: string, start: string, end: string, excludeResId?: string) => {
        try {
            return await supabaseService.checkAvailability(clotheId, start, end, excludeResId);
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return {
        reservations,
        loading,
        error,
        addReservation,
        updateReservationStatus,
        convertQuotation,
        checkAvailability,
        refreshReservations: fetchReservations
    };
};
