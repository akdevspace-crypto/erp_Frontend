import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'

const mockData: any[] = []

export function InHouseCare() {
    const [searchQuery, setSearchQuery] = useState('')
    const [unitFilter, setUnitFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const metrics = { occupied: 0, nonAllocated: 1 }

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 font-medium text-sm">{index + 1}</span> },
        { key: 'serviceDetails', header: 'Service Details', cell: (row) => <span className="text-sm dark:text-gray-300">{row.service || '-'}</span> },
        { key: 'clientDetails', header: 'Client Details', cell: (row) => <span className="text-sm font-medium dark:text-gray-200">{row.clientName || '-'}</span> },
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

            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 mt-4 overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-white/10 border-b border-gray-200 dark:border-white/10 py-6">
                    <div className="flex justify-center items-center">
                        <span className="text-xl font-medium text-blue-600 dark:text-blue-400">Total Room Occupied - {metrics.occupied.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex justify-center items-center">
                        <span className="text-xl font-medium text-red-500 dark:text-red-400">Room Not Allocated - {metrics.nonAllocated.toString().padStart(2, '0')}</span>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                    <p className="text-sm font-medium text-gray-600 mb-4 ml-1">In-House Care List</p>
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
                </div>

                <div className="p-4">
                    <DataTable
                        data={mockData}
                        columns={columns}
                        keyExtractor={(item: any) => item.id || Math.random().toString()}
                        emptyStateMessage="No data available in table"
                    />
                </div>
            </div>
        </div>
    )
}
