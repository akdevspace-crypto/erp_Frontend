import { Plus, Filter, Download } from 'lucide-react'
import { cn } from '../lib/utils'

interface ActionBarProps {
    onAdd?: () => void
    onFilter?: () => void
    onExport?: () => void
    addLabel?: string
    exportLabel?: string
    className?: string
}

export function ActionBar({
    onAdd,
    onFilter,
    onExport,
    addLabel = 'Add New',
    exportLabel = 'Export',
    className
}: ActionBarProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-3 mb-4", className)}>
            {onFilter && (
                <button
                    onClick={onFilter}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-[13.5px] font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
                >
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    Filter
                </button>
            )}
            <div className="flex-1" />
            {onExport && (
                <button
                    onClick={onExport}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-[13.5px] font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
                >
                    <Download className="h-4 w-4 mr-2 text-gray-400" />
                    Export
                </button>
            )}
            {onAdd && (
                <button
                    onClick={onAdd}
                    className="inline-flex items-center px-4 py-2.5 shadow-sm text-[13.5px] font-medium rounded-xl text-white bg-gradient-to-r from-[#3f5f6a] to-[#1f3b4d] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(63,95,106,0.22)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3f5f6a] transition-all active:scale-95 border border-transparent"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {addLabel}
                </button>
            )}
            {onExport && (
                <button
                    onClick={onExport}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-[13.5px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
                >
                    <Download className="h-4 w-4" />
                    {exportLabel}
                </button>
            )}
        </div>
    )
}
