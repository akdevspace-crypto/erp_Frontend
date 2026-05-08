import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';

export interface Room {
    id: string;
    code: string;
    status: boolean;
    [key: string]: any;
}

export const roomService = {
    getAll: async (): Promise<Room[]> => {
        const res = await api.get('/master/room');
        return res.data.data;
    },
    create: async (data: any): Promise<Room> => {
        const res = await api.post('/master/room', data);
        return res.data.data;
    },
    update: async (id: string, data: any): Promise<Room> => {
        const res = await api.put(`/master/room/${id}`, data);
        return res.data.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/master/room/${id}`);
    }
};

export function useRooms() {
    return useQuery({
        queryKey: ['rooms'],
        queryFn: roomService.getAll
    });
}

export function useCreateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: roomService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }
    });
}

export function useUpdateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => roomService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }
    });
}

export function useDeleteRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: roomService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }
    });
}
