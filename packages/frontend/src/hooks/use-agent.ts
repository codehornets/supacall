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
    selectedAgentId: string | null;
    loading: boolean;
    error: string | null;
    selectedAgent: Agent | null;
    init: () => Promise<void>;
    createAgent: (data: CreateAgentData) => Promise<Agent>;
    updateAgent: (id: string, data: CreateAgentData) => Promise<Agent>;
    deleteAgent: (id: string) => Promise<void>;
    setSelectedAgentId: (id: string | null) => void;
    setState: (state: Partial<AgentState>) => void;
}

export const useAgent = create<AgentState>((set, get) => ({
    agents: [],
    selectedAgentId: null,
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
            const selectedAgentId = get().selectedAgentId;
            if (!selectedAgentId && agents.length > 0) {
                set({ 
                    agents,
                    selectedAgentId: agents[0].id,
                    selectedAgent: agents[0],
                    loading: false,
                    error: null
                });
            } else {
                set({ 
                    agents,
                    selectedAgent: agents.find(a => a.id === selectedAgentId) || null,
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
                selectedAgentId: response.data.id,
                selectedAgent: response.data
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
                selectedAgent: state.selectedAgentId === id ? response.data : state.selectedAgent
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
                const newSelectedId = state.selectedAgentId === id
                    ? (remainingAgents.length > 0 ? remainingAgents[0].id : null)
                    : state.selectedAgentId;
                
                return {
                    agents: remainingAgents,
                    selectedAgentId: newSelectedId,
                    selectedAgent: remainingAgents.find(a => a.id === newSelectedId) || null
                };
            });
        } catch (err) {
            throw err;
        }
    },

    setSelectedAgentId: (id: string | null) => {
        set(state => ({
            selectedAgentId: id,
            selectedAgent: state.agents.find(a => a.id === id) || null
        }));
    }
}));
