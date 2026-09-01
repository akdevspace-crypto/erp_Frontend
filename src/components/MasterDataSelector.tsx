import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Select } from './Select';

interface MasterDataSelectorProps {
    type: 'departments' | 'units' | 'floors' | 'rooms' | 'beds' | 'categories';
    value: string;
    onChange: (id: string, name?: string) => void;
    parentId?: string; // e.g., unitId for floors, floorId for rooms
    label?: string;
    error?: string;
    required?: boolean;
    className?: string;
}

export function MasterDataSelector({
    type,
    value,
    onChange,
    parentId,
    label,
    error,
    required = false,
    className = ''
}: MasterDataSelectorProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['master-data', type, parentId],
        queryFn: async () => {
            let url = `/master/${type}`;
            if (parentId) {
                const paramName = type === 'floors' ? 'unitId' : type === 'rooms' ? 'floorId' : type === 'beds' ? 'roomId' : 'parentId';
                url += `?${paramName}=${parentId}`;
            }
            const res = await api.get(url);
            return res.data?.data || res.data || [];
        }
    });

    const options = data?.map((item: any) => ({
        value: item.id,
        label: item.name || item.title || 'Unknown'
    })) || [];

    const defaultLabel = label || `Select ${type}...`;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedOption = options.find((o: any) => o.value === selectedId);
        onChange(selectedId, selectedOption?.label);
    };

    return (
        <Select
            label={defaultLabel}
            value={value}
            onChange={handleChange}
            error={error}
            required={required}
            className={className}
            options={options}
            placeholder={isLoading ? 'Loading...' : 'Select a...'}
            disabled={isLoading || (!!parentId && !options.length)}
        />
    );
}

