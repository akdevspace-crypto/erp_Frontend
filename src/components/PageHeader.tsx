import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface PageHeaderProps {
    title: string
    subtitle?: string
    breadcrumbs?: BreadcrumbItem[]
}

export function PageHeader({ title, subtitle, breadcrumbs = [] }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between px-2 sm:px-4">
            <div>
                <h1 className="text-[24px] font-black tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
                {subtitle && <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-0.5">{subtitle}</p>}
                {breadcrumbs.length > 0 && (
                    <nav className="mt-2 flex text-sm text-gray-500" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            {breadcrumbs.map((item, index) => (
                                <li key={item.label} className="inline-flex items-center">
                                    {index > 0 && <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />}
                                    {item.href ? (
                                        <Link
                                            to={item.href}
                                            className="inline-flex items-center hover:text-[#00b3a7] font-medium transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}
            </div>
        </div>
    )
}
