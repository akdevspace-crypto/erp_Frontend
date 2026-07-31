import { api } from '../../../lib/axios'
import type { CreateProductPayload, CreatePurchasePayload, CreateStockIssueRequestPayload, InventoryProduct, InventoryPurchase, InventoryStock, InventoryStockIssueRequest, InventoryStockMovement, UpdateStockPayload } from '../types'

export type InventoryReadOptions = {
    scope?: 'all'
    unitId?: string | null
}

const readConfig = (options?: InventoryReadOptions) => ({
    params: options?.unitId ? { unitId: options.unitId } : options?.scope === 'all' ? { scope: 'all' } : undefined,
    headers: options?.unitId ? { 'x-unit-id': options.unitId } : undefined
})

export const inventoryService = {
    getProducts: async (options?: InventoryReadOptions): Promise<InventoryProduct[]> => {
        const response = await api.get('/product', readConfig(options))
        return response.data?.data || []
    },

    createProduct: async (payload: CreateProductPayload): Promise<InventoryProduct> => {
        const response = await api.post('/product', payload)
        return response.data?.data
    },

    getStock: async (options?: InventoryReadOptions): Promise<InventoryStock[]> => {
        const response = await api.get('/stock', readConfig(options))
        return response.data?.data || []
    },

    getStockMovements: async (options?: InventoryReadOptions): Promise<InventoryStockMovement[]> => {
        const response = await api.get('/stock/movements', readConfig(options))
        return response.data?.data || []
    },

    updateStock: async (payload: UpdateStockPayload): Promise<InventoryStock> => {
        const response = await api.post('/stock/update', payload)
        return response.data?.data
    },

    getPurchases: async (options?: InventoryReadOptions): Promise<InventoryPurchase[]> => {
        const response = await api.get('/purchase', readConfig(options))
        return response.data?.data || []
    },

    createPurchase: async (payload: CreatePurchasePayload): Promise<InventoryPurchase> => {
        const response = await api.post('/purchase', payload)
        return response.data?.data
    },

    getStockIssueRequests: async (options?: InventoryReadOptions): Promise<InventoryStockIssueRequest[]> => {
        const response = await api.get('/stock/issue-requests', readConfig(options))
        return response.data?.data || []
    },

    createStockIssueRequest: async (payload: CreateStockIssueRequestPayload): Promise<InventoryStockIssueRequest> => {
        const response = await api.post('/stock/issue-requests', payload)
        return response.data?.data
    },

    approveStockIssueRequest: async (id: string): Promise<InventoryStockIssueRequest> => {
        const response = await api.post(`/stock/issue-requests/${id}/approve`)
        return response.data?.data
    },

    rejectStockIssueRequest: async (id: string): Promise<InventoryStockIssueRequest> => {
        const response = await api.post(`/stock/issue-requests/${id}/reject`)
        return response.data?.data
    }
}
