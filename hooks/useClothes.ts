import { useState, useEffect, useCallback } from 'react';
import { Clothe, ClotheStatus } from '../types';
import { supabaseService } from '../services/supabaseService';

export const useClothes = () => {
    const [clothes, setClothes] = useState<Clothe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClothes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supabaseService.getClothes();
            setClothes(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar peças do estoque.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClothes();
    }, [fetchClothes]);

    const addClothe = async (clothe: Omit<Clothe, 'id' | 'rent_count' | 'history'>) => {
        try {
            const newClothe = await supabaseService.addClothe(clothe);
            setClothes(prev => [newClothe, ...prev]);
            return newClothe;
        } catch (err) {
            console.error(err);
            throw new Error('Erro ao adicionar peça.');
        }
    };

    const updateStatus = async (id: string, status: ClotheStatus, note: string) => {
        try {
            await supabaseService.updateClotheStatus(id, status, note);
            await fetchClothes(); // Recarregar para garantir consistência
        } catch (err) {
            console.error(err);
            throw new Error('Erro ao atualizar status.');
        }
    };

    return { clothes, loading, error, addClothe, updateStatus, refreshClothes: fetchClothes };
};
