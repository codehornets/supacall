"use client"

import { api } from '@/lib/api';
import { create } from 'zustand';

export interface Agent {
    id: string;
    name: string;
    description: string;
    allowWebsite: boolean;
    allowPhone: boolean;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
}

export interface CreateAgentData {
    name: string;
    description: string;
    allowWebsite?: boolean;
    allowPhone?: boolean;
}

interface AgentState {
    agents: Agent[];
    loading: boolean;
    error: string | null;
    selectedAgent: string | null;
    init: () => Promise<void>;
    createAgent: (data: CreateAgentData) => Promise<Agent>;
    updateAgent: (id: string, data: CreateAgentData) => Promise<Agent>;
    deleteAgent: (id: string) => Promise<void>;
    setSelectedAgent: (id: string | null) => void;
    setState: (state: Partial<AgentState>) => void;
}

export const useAgent = create<AgentState>((set, get) => ({
    agents: [],
    loading: true,
    error: null,
    selectedAgent: null,
    setState: (newState) => set(newState),

    init: async () => {
        try {
            set({ loading: true });
            const response = await api.get<Agent[]>('/agents');
            const agents = response.data;
            
            // If there's no selected agent and we have agents, select the first one
            const selectedAgentId = get().selectedAgent;
            if (!selectedAgentId && agents.length > 0) {
                set({ 
                    agents,
                    selectedAgent: agents[0].id,
                    loading: false,
                    error: null
                });
            } else {
                set({ 
                    agents,
                    selectedAgent: agents.find(a => a.id === selectedAgentId)?.id || null,
                    loading: false,
                    error: null
                });
            }
        } catch (err) {
            console.error('Error fetching agents:', err);
            set({ 
                error: 'Failed to fetch agents',
                loading: false
            });
        }
    },

    createAgent: async (data: CreateAgentData) => {
        try {
            const response = await api.post<Agent>('/agents', data);
            set(state => ({ 
                agents: [response.data, ...state.agents],
                selectedAgent: response.data.id,
            }));
            return response.data;
        } catch (err) {
            throw err;
        }
    },

    updateAgent: async (id: string, data: CreateAgentData) => {
        try {
            const response = await api.put<Agent>(`/agents/${id}`, data);
            set(state => ({
                agents: state.agents.map(agent => agent.id === id ? response.data : agent),
                selectedAgent: state.selectedAgent === id ? response.data.id : state.selectedAgent
            }));
            return response.data;
        } catch (err) {
            throw err;
        }
    },

    deleteAgent: async (id: string) => {
        try {
            await api.delete(`/agents/${id}`);
            set(state => {
                const remainingAgents = state.agents.filter(agent => agent.id !== id);
                const newSelectedId = state.selectedAgent === id
                    ? (remainingAgents.length > 0 ? remainingAgents[0].id : null)
                    : state.selectedAgent;
                
                return {
                    agents: remainingAgents,
                    selectedAgent: newSelectedId,
                };
            });
        } catch (err) {
            throw err;
        }
    },

    setSelectedAgent: (id: string | null) => {
        set(state => ({
            selectedAgent: id,
        }));
    }
}));
