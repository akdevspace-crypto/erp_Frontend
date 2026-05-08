import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'

const mockData: any[] = []

export function Vitals() {
    const [searchQuery, setSearchQuery] = useState('')
    const [unitFilter, setUnitFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const metrics = { occupied: 0, nonAllocated: 1 }

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 font-medium text-sm">{index + 1}</span> },
        { key: 'serviceDetails', header: 'Service Details', cell: (row) => <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.service || '-'}</span> },
        { key: 'clientDetails', header: 'Client Details', cell: (row) => <span className="text-sm font-medium dark:text-gray-300">{row.clientName || '-'}</span> },
        { key: 'guardianDetails', header: 'Guardian Details', cell: (row) => <span className="text-sm dark:text-gray-400">{row.guardian || '-'}</span> },
        { key: 'allocatedStatus', header: 'Allocated Status', cell: (row) => <StatusHighlighter value={row.status} /> },
        { key: 'paymentDetails', header: 'Payment Details', cell: (row) => <span className="text-sm dark:text-gray-400">{row.payment || '-'}</span> },
        {
            key: 'applicationForm',
            header: 'Application Form',
            cell: () => (
                <button className="px-3 py-1.5 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-white/5 text-xs font-semibold rounded shadow-sm transition-all active:scale-95">
                    View Form
                </button>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-black">
            <PageHeader
                title="Service Desk - In-House Care"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'In-House Care' }
                ]}
            />

            {/* Metrics Row */}
            <div className="flex flex-col md:flex-row items-center justify-around p-6 bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 mt-4 mb-4">
                <div className="text-center">
                    <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">
                        {metrics.occupied.toString().padStart(2, '0')}
                    </span>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Total Room Occuppied</p>
                </div>
                <div className="hidden md:block w-px h-12 bg-gray-200"></div>
                <div className="text-center mt-4 md:mt-0">
                    <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">
                        {metrics.nonAllocated.toString().padStart(2, '0')}
                    </span>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Room Not Alloacated</p>
                </div>
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search..."
                filters={[
                    {
                        name: 'unitFilter',
                        options: [
                            { value: '', label: 'UEC - Coimbatore' }
                        ],
                        value: unitFilter,
                        onChange: (e) => setUnitFilter(e.target.value)
                    },
                    {
                        name: 'statusFilter',
                        options: [
                            { value: '', label: 'All Status' }
                        ],
                        value: statusFilter,
                        onChange: (e) => setStatusFilter(e.target.value)
                    }
                ]}
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
