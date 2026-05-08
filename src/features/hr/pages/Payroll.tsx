import { useState, useMemo } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { Download } from 'lucide-react'

export function Payroll() {
    const [data] = useState([
        { id: '1', empId: 'E-001', name: 'Dr. Ramesh Kumar', month: 'October 2023', basePay: 120000, deductions: 5000, netPay: 115000, status: 'Processed' },
        { id: '2', empId: 'E-002', name: 'Sister Anita', month: 'October 2023', basePay: 45000, deductions: 2000, netPay: 43000, status: 'Pending' },
    ])

    const [searchQuery, setSearchQuery] = useState('')

    const filteredData = useMemo(() => {
        return data.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.empId.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [data, searchQuery])

    const columns: Column<any>[] = [
        { key: 'empId', header: 'Emp ID', sortable: true },
        { key: 'name', header: 'Staff Name', sortable: true },
        { key: 'month', header: 'Salary Month', sortable: true },
        { key: 'basePay', header: 'Gross Pay (₹)', cell: d => d.basePay.toLocaleString() },
        { key: 'deductions', header: 'Deductions (₹)', cell: d => d.deductions.toLocaleString() },
        { key: 'netPay', header: 'Net Payable (₹)', cell: d => d.netPay.toLocaleString(), sortable: true },
        { key: 'status', header: 'Status', cell: (d) => <StatusHighlighter value={d.status} /> }
    ]

    return (
        <div className="flex flex-col h-full space-y-6 bg-transparent dark:bg-black">
            <PageHeader title="Payroll Processing" breadcrumbs={[{ label: 'Human Resource' }, { label: 'Payroll' }]} />
            <div className="flex justify-end gap-3 mb-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-800 bg-black text-gray-300 font-medium rounded-md hover:bg-white/5 shadow-sm">
                    Run Payroll Batch
                </button>
            </div>
            <FilterSection searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} searchPlaceholder="Search staff for payslips..." />
            <DataTable data={filteredData} columns={columns} keyExtractor={(d) => d.id} actions={() => (
                <button className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded flex items-center gap-1" title="Download Payslip">
                    <Download className="h-4 w-4" />
                </button>
            )} />
        </div>
    )
}
