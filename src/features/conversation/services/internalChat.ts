import { api } from '../../../lib/axios'

export interface ChatStaff {
    id: string
    firstName: string
    lastName: string
    designation: string
    department?: string
    userId: string
    photoUrl?: string
}

export interface InternalMessage {
    id: string
    conversationId: string
    body: string
    sender: string
    createdAt: string
    metadata?: any
}

export interface InternalConversation {
    id: string
    messages: InternalMessage[]
}

export const internalChatService = {
    getStaff: async (): Promise<ChatStaff[]> => {
        const response = await api.get('/internal/staff')
        return response.data.data
    },

    getOrCreateConversation: async (targetUserId: string): Promise<InternalConversation> => {
        const response = await api.post('/internal/conversation', { targetUserId })
        return response.data.data
    },

    sendMessage: async (conversationId: string, body: string): Promise<InternalMessage> => {
        const response = await api.post('/internal/message', { conversationId, body })
        return response.data.data
    }
}
