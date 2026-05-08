import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { History as HistoryIcon } from 'lucide-react'

const mockData: any[] = []

export function PendingFeedback() {
    const [searchQuery, setSearchQuery] = useState('')

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{index + 1}</span> },
        { key: 'clientRef', header: 'Client Ref. No.', cell: (row) => <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{row.ref || '-'}</span> },
        { key: 'serviceLookingFor', header: 'Service Looking for', cell: (row) => <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.service || '-'}</span> },
        { key: 'clientDetails', header: 'Client Details', cell: (row) => <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.clientName || '-'}</span> },
        { key: 'allocatedStatus', header: 'Allocated Status', cell: (row) => <StatusHighlighter value={row.status} /> },
        { key: 'allocatedDetails', header: 'Allocated Details', cell: (row) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.allocatedDetails || '-'}</span> },
        {
            key: 'followUpHistory',
            header: 'Follow-Up History',
            cell: () => (
                <button className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/5 rounded" title="View History">
                    <HistoryIcon className="h-4 w-4" />
                </button>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full bg-transparent dark:bg-black">
            <PageHeader
                title="Client Service Feedback (Allocated Staff)"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Service Followup & Feedback' }
                ]}
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search feedback..."
            />

            <DataTable
                data={mockData}
                columns={columns}
                keyExtractor={(item: any) => item.id || Math.random().toString()}
                emptyStateMessage="No data available in table"
            />
        </div>
    )
}
