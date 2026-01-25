
import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '../types';
import { supabaseService } from '../services/supabaseService';

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supabaseService.getStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar estatísticas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const updateProjection = useCallback(async (monthYear: string, expectedValue: number) => {
        try {
            await supabaseService.updateProjection(monthYear, expectedValue);
            await fetchStats();
        } catch (err) {
            throw err;
        }
    }, [fetchStats]);

    const recordPayment = useCallback(async (id: string, amount: number) => {
        try {
            await supabaseService.recordPayment(id, amount);
            await fetchStats();
        } catch (err) {
            throw err;
        }
    }, [fetchStats]);

    return { stats, loading, error, refreshStats: fetchStats, updateProjection, recordPayment };
};
