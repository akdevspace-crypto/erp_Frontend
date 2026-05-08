import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'

const mockData: any[] = []

export function Revenue() {
    const [searchQuery, setSearchQuery] = useState('')

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 font-medium text-sm">{index + 1}</span> },
        { key: 'serviceDetails', header: 'Service Details', cell: (row) => <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.service || '-'}</span> },
        { key: 'clientDetails', header: 'Client Details', cell: (row) => <span className="text-sm font-medium dark:text-gray-300">{row.clientName || '-'}</span> },
        { key: 'guardianDetails', header: 'Guardian Details', cell: (row) => <span className="text-sm dark:text-gray-400">{row.guardian || '-'}</span> },
        { key: 'dailyRevenue', header: 'Daily Revenue (Nursing)', cell: (row) => <span className="text-sm dark:text-gray-400">{row.revenue || '-'}</span> }
    ]

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-black">
            <PageHeader
                title="In-House Care (INCOME AND EXPENDITUR FORM)"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'In-House Care' }
                ]}
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search..."
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
