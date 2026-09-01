import { api } from '../../lib/axios';

export const getProjects = async () => {
    const res = await api.get('/funding-projects/projects');
    return res.data?.data || [];
};

export const createProject = async (payload: any) => {
    const res = await api.post('/funding-projects/projects', payload);
    return res.data?.data;
};

export const getFundingAllocations = async () => {
    const res = await api.get('/funding-projects/funding-allocations');
    return res.data?.data || [];
};

export const createFundingAllocation = async (payload: any) => {
    const res = await api.post('/funding-projects/funding-allocations', payload);
    return res.data?.data;
};

