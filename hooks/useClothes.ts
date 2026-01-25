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
            throw new Error('Erro ao adicionar peça.');
        }
    };

    const updateClothe = async (id: string, clothe: Partial<Clothe>) => {
        try {
            const updated = await supabaseService.updateClothe(id, clothe);
            setClothes(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            throw new Error('Erro ao atualizar peça.');
        }
    };

    const deleteClothe = async (id: string) => {
        try {
            await supabaseService.deleteClothe(id);
            setClothes(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            throw new Error('Erro ao excluir peça.');
        }
    };

    const uploadImage = async (id: string, file: File) => {
        try {
            const url = await supabaseService.uploadClotheImage(id, file);
            return url;
        } catch (err) {
            throw new Error('Erro ao fazer upload da imagem.');
        }
    };

    const updateStatus = async (id: string, status: ClotheStatus, note: string) => {
        try {
            await supabaseService.updateClotheStatus(id, status, note);
            await fetchClothes(); // Recarregar para garantir consistência
        } catch (err) {
            throw new Error('Erro ao atualizar status.');
        }
    };

    const importClothes = async (clothesData: Omit<Clothe, 'id' | 'rent_count' | 'history'>[]) => {
        try {
            await supabaseService.importClothes(clothesData);
            await fetchClothes();
        } catch (err) {
            throw new Error('Erro ao importar peças.');
        }
    };

    return { clothes, loading, error, addClothe, updateClothe, deleteClothe, updateStatus, uploadImage, importClothes, refreshClothes: fetchClothes };
};
