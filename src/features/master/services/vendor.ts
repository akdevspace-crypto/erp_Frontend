import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';

export interface Vendor {
    id: string;
    code: string;
    status: boolean;
    [key: string]: any;
}

export const vendorService = {
    getAll: async (): Promise<Vendor[]> => {
        const res = await api.get('/master/vendor');
        return res.data.data;
    },
    create: async (data: any): Promise<Vendor> => {
        const res = await api.post('/master/vendor', data);
        return res.data.data;
    },
    update: async (id: string, data: any): Promise<Vendor> => {
        const res = await api.put(`/master/vendor/${id}`, data);
        return res.data.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/master/vendor/${id}`);
    }
};

export function useVendors() {
    return useQuery({
        queryKey: ['vendors'],
        queryFn: vendorService.getAll
    });
}

export function useCreateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: vendorService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        }
    });
}

export function useUpdateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => vendorService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        }
    });
}

export function useDeleteVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: vendorService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        }
    });
}
