import { api as axios } from '../../lib/axios';
import type { VisitorPass, VisitorProfile } from './types';

export const checkVisitorProfile = async (mobile: string): Promise<VisitorProfile | null> => {
    const res = await axios.get(`/visitor/profile/${mobile}`);
    return res.data?.data;
};

export const createVisitorPass = async (payload: any): Promise<{ profile: VisitorProfile; pass: VisitorPass }> => {
    const res = await axios.post('/visitor/pass', payload);
    return res.data?.data;
};

export const getVisitorPasses = async (): Promise<VisitorPass[]> => {
    const res = await axios.get('/visitor/passes');
    return res.data?.data || [];
};

export const getVisitorAnalytics = async (): Promise<any> => {
    const res = await axios.get('/visitor/analytics');
    return res.data?.data;
};

export const updateVisitorPass = async (id: string, payload: any): Promise<any> => {
    const res = await axios.put(`/visitor/pass/${id}`, payload);
    return res.data?.data;
};

export const checkoutVisitorPass = async (id: string): Promise<any> => {
    const res = await axios.patch(`/visitor/pass/${id}/checkout`);
    return res.data?.data;
};

