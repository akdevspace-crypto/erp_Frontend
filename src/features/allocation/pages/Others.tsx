import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { useOthersAllocations } from '../hooks/useAllocation'

export function OthersAllocation() {
    const { data = [], isLoading } = useOthersAllocations()
    const [searchQuery, setSearchQuery] = useState('')

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 font-medium text-sm">{index + 1}</span> },
        { key: 'clientRef', header: 'Client Ref. No.', cell: (row) => <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{row.ref || '-'}</span> },
        { key: 'serviceLookingFor', header: 'Service Looking for', cell: (row) => <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.service || '-'}</span> },
        { key: 'clientDetails', header: 'Client Details', cell: (row) => <span className="text-sm font-medium dark:text-gray-300">{row.clientName || '-'}</span> },
        { key: 'staffName', header: 'Assigned Staff', cell: (row) => <span className="text-sm text-gray-600 dark:text-gray-400">{row.staffName || '-'}</span> },
        {
            key: 'followUpHistory',
            header: 'Follow-Up History',
            cell: () => (
                <button className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded shadow-sm transition-all active:scale-95">
                    History
                </button>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-black">
            <PageHeader
                title="Client Followup - Staff Allocation"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Staff Allocation' }
                ]}
            />

            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 mt-4 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                    <p className="text-sm font-medium text-gray-600 mb-4 ml-1">Staff Allocation List</p>
                    <FilterSection
                        searchQuery={searchQuery}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                        searchPlaceholder="Search..."
                    />
                </div>

                <div className="p-4">
                    <DataTable
                        data={data}
                        columns={columns}
                        isLoading={isLoading}
                        keyExtractor={(item: any) => item.id || Math.random().toString()}
                        emptyStateMessage="No data available in table"
                    />
                </div>
            </div>
        </div>
    )
}
