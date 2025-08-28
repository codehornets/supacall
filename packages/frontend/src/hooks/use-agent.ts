"use client"

import { useState, useEffect } from 'react';
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

interface AgentStore {
    selectedAgentId: string | null;
    setSelectedAgentId: (id: string | null) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
    selectedAgentId: null,
    setSelectedAgentId: (id) => set({ selectedAgentId: id }),
}));

export function useAgent() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedAgentId, setSelectedAgentId } = useAgentStore();

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get<Agent[]>('/agents');
            setAgents(response.data);
            // If there's no selected agent and we have agents, select the first one
            if (!selectedAgentId && response.data.length > 0) {
                setSelectedAgentId(response.data[0].id);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch agents');
            console.error('Error fetching agents:', err);
        } finally {
            setLoading(false);
        }
    };

    const createAgent = async (data: CreateAgentData) => {
        try {
            const response = await api.post<Agent>('/agents', data);
            setAgents(prev => [response.data, ...prev]);
            setSelectedAgentId(response.data.id);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateAgent = async (id: string, data: CreateAgentData) => {
        try {
            const response = await api.put<Agent>(`/agents/${id}`, data);
            setAgents(prev => prev.map(agent => agent.id === id ? response.data : agent));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteAgent = async (id: string) => {
        try {
            await api.delete(`/agents/${id}`);
            setAgents(prev => prev.filter(agent => agent.id !== id));
            if (selectedAgentId === id) {
                const remainingAgents = agents.filter(a => a.id !== id);
                setSelectedAgentId(remainingAgents.length > 0 ? remainingAgents[0].id : null);
            }
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    return {
        agents,
        loading,
        error,
        createAgent,
        updateAgent,
        deleteAgent,
        refetch: fetchAgents,
        selectedAgentId,
        setSelectedAgentId,
        selectedAgent: agents.find(a => a.id === selectedAgentId) || null,
    };
}