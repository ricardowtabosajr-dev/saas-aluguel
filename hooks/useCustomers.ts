import { useState, useEffect, useCallback } from 'react';
import { Customer } from '../types';
import { supabaseService } from '../services/supabaseService';

export const useCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supabaseService.getCustomers();
            setCustomers(data);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar clientes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const addCustomer = async (customer: Omit<Customer, 'id'>) => {
        try {
            const newCustomer = await supabaseService.addCustomer(customer);
            setCustomers(prev => [...prev, newCustomer]);
            return newCustomer;
        } catch (err) {
            throw new Error('Erro ao adicionar cliente.');
        }
    };

    const updateCustomer = async (id: string, customer: Partial<Customer>) => {
        try {
            const updated = await supabaseService.updateCustomer(id, customer);
            setCustomers(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            throw new Error('Erro ao atualizar cliente.');
        }
    };

    const deleteCustomer = async (id: string) => {
        try {
            await supabaseService.deleteCustomer(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            throw new Error('Erro ao excluir cliente.');
        }
    };

    return { customers, loading, error, addCustomer, updateCustomer, deleteCustomer, refreshCustomers: fetchCustomers };
};
