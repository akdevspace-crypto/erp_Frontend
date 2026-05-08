import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/PageHeader'
import { useToast } from '../../../components/Toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { hrService } from '../services/hr'
import { useUnits } from '../../master/hooks/useUnit'

function CustomSwitch({ checked, onChange, onText = 'View Access Only', offText = 'View Access Only' }: { checked: boolean, onChange: () => void, onText?: string, offText?: string }) {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? 'bg-green-500' : 'bg-red-500'}`}
                role="switch"
                aria-checked={checked}
                onClick={onChange}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                {checked ? onText : offText}
            </span>
        </div>
    )
}

const matrixStructure = [
    {
        category: 'Master',
        items: [
            'City Master', 'Unit Master', 'Client Services', 'Department Master',
            'Designation Master', 'Labour Services', 'Payment Category', 'Vendor Master', 'Room Mgt'
        ]
    },
    {
        category: 'Enquiry Desk',
        items: ['Enquiry Follow-up', 'New Enquiry Form', 'All Client Details', 'UEC Enquiry']
    },
    {
        category: 'Allocation Desk',
        items: ['Home Care', 'Clinical Care', 'In-House Care', 'Others']
    },
    {
        category: 'Business Desk',
        items: ['Welcome Call']
    },
    {
        category: 'Adv. Customer Care (HC)',
        items: ['Pending Feedbacks', 'Customer Complaints', 'Service History']
    },
    {
        category: 'In-House Care',
        items: ['Revenue Form', 'Vital Form']
    },
    {
        category: 'Daily Logs',
        items: ['Daily Cash Sheet', 'Guardian Visit Log', 'Visitors Log']
    },
    {
        category: 'Accounts',
        items: ['Cashbox', 'Cashbox Pending', 'Income', 'Expense', 'In-house Expense']
    },
    {
        category: 'Human Resource',
        items: ['Staff Management', 'Staff Privilege', 'Labour Mgt']
    }
]

export function StaffMenuPrivilege() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: staffData } = useQuery({
        queryKey: ['staff'],
        queryFn: hrService.getStaff
    })

    const { data: unitsList = [] } = useUnits()

    const staff = staffData?.find(s => s.id === id)
    const staffUnit = unitsList.find((unit) => unit.id === staff?.unitId)

    const [unitAccessMode, setUnitAccessMode] = useState<'all' | 'individual'>('individual')
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])
    const [permissions, setPermissions] = useState<Record<string, { view: boolean, createUpdate: boolean }>>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const menuPrivilege = staff?.metadata?.menuPrivilege
        if (!menuPrivilege) {
            setUnitAccessMode('individual')
            setSelectedUnitIds([])
            setPermissions({})
            return
        }

        setUnitAccessMode(menuPrivilege.unitAccessMode === 'all' ? 'all' : 'individual')
        setSelectedUnitIds(Array.isArray(menuPrivilege.selectedUnitIds) ? menuPrivilege.selectedUnitIds : [])
        setPermissions(menuPrivilege.permissions && typeof menuPrivilege.permissions === 'object' ? menuPrivilege.permissions : {})
    }, [staff])

    const togglePermission = (item: string, type: 'view' | 'createUpdate') => {
        setPermissions(prev => ({
            ...prev,
            [item]: {
                view: prev[item]?.view || false,
                createUpdate: prev[item]?.createUpdate || false,
                [type]: !(prev[item]?.[type])
            }
        }))
    }

    const toggleUnitSelection = (unitId: string) => {
        setSelectedUnitIds(prev => prev.includes(unitId)
            ? prev.filter(id => id !== unitId)
            : [...prev, unitId]
        )
    }

    const handleSave = async () => {
        if (!staff?.id) return

        setIsSaving(true)
        try {
            await hrService.updateStaffMenuPrivilege(staff.id, {
                unitAccessMode,
                selectedUnitIds: unitAccessMode === 'all' ? [] : selectedUnitIds,
                permissions
            })
            await queryClient.invalidateQueries({ queryKey: ['staff'] })
            toast({ type: 'success', title: 'Saved', message: 'Staff menu privilege map updated successfully' })
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to save staff menu privilege'
            toast({ type: 'error', title: 'Error', message })
        } finally {
            setIsSaving(false)
        }
    }

    if (!staff) {
        return <div className="p-8 text-center text-gray-500">Loading Staff Details...</div>
    }

    return (
        <div className="flex flex-col h-full space-y-6 bg-transparent dark:bg-black">
            <PageHeader title="Staff Menu Privilege" breadcrumbs={[{ label: 'Home' }, { label: 'Staff Login Privilege' }]} />

            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 overflow-y-auto h-[calc(100vh-10rem)]">
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 sticky top-0 z-10">
                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">Edit - Staff Menu Privilege</h2>
                    <button onClick={() => navigate('/hr/staff-privilege')} className="px-3 py-1.5 bg-white dark:bg-black border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium rounded-md text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition shadow-sm">
                        &lt; Back to Privileges
                    </button>
                </div>

                <div className="p-6">
                    <div className="max-w-4xl mx-auto border border-gray-200 dark:border-white/10 rounded-md overflow-hidden mb-8">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10 text-gray-900 dark:text-gray-100">
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
                                <tr>
                                    <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 text-center w-1/2">Staff Ref. No. / Emp. ID</td>
                                    <td className="px-6 py-3 text-center w-1/2">{staff.empId}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 text-center">Staff Name</td>
                                    <td className="px-6 py-3 text-center">{staff.name}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 text-center">
                                        <div>Unit Name</div>
                                        <div className="text-xs text-gray-500 font-normal">Location</div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <div>{staffUnit?.name || 'Unknown Unit'}</div>
                                        <div className="text-xs text-gray-500">{staffUnit?.location?.label || '-'}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 text-center">Department</td>
                                    <td className="px-6 py-3 text-center">{staff.department}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 text-center">Designation</td>
                                    <td className="px-6 py-3 text-center">{staff.role}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="max-w-4xl mx-auto mb-10">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Select the Unit for Access</h3>
                        <div className="flex items-center gap-6 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={unitAccessMode === 'all'} onChange={() => setUnitAccessMode('all')} className="translate-y-[1px] text-red-500 focus:ring-red-500" />
                                <span className={`text-sm font-medium ${unitAccessMode === 'all' ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-600'}`}>Assign All Unit Access</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={unitAccessMode === 'individual'} onChange={() => setUnitAccessMode('individual')} className="translate-y-[1px] text-red-500 focus:ring-red-500" />
                                <span className={`text-sm font-medium ${unitAccessMode === 'individual' ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-600'}`}>Assign Individual Unit Access</span>
                            </label>
                        </div>

                        {unitAccessMode === 'individual' && (
                            <div className="flex flex-col gap-2 pl-8">
                                {unitsList.map((u: any) => (
                                    <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded text-primary-600"
                                            checked={selectedUnitIds.includes(u.id)}
                                            onChange={() => toggleUnitSelection(u.id)}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{u.name} <span className="font-normal text-xs text-gray-500">{u.location?.label || ''}</span></span>
                                    </label>
                                ))}
                                {unitsList.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">No units registered in database</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {matrixStructure.map((category) => (
                            <div key={category.category}>
                                <h3 className="text-lg font-medium text-gray-100 mb-4">{category.category}</h3>
                                <div className="border border-white/10 rounded-md overflow-hidden bg-black">
                                    <table className="min-w-full divide-y divide-white/10">
                                        <tbody className="divide-y divide-white/10">
                                            {category.items.map((item) => {
                                                const noCreate = item === 'All Client Details' || item === 'Service History'
                                                return (
                                                    <tr key={item} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 w-1/3 border-r border-white/10">
                                                            {item}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-white/10">
                                                            <div className="flex justify-center">
                                                                <CustomSwitch
                                                                    checked={permissions[item]?.view || false}
                                                                    onChange={() => togglePermission(item, 'view')}
                                                                    onText="View Access Only" offText="View Access Only"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {noCreate ? (
                                                                <div className="text-center text-gray-400 font-medium text-sm">NA</div>
                                                            ) : (
                                                                <div className="flex justify-center">
                                                                    <CustomSwitch
                                                                        checked={permissions[item]?.createUpdate || false}
                                                                        onChange={() => togglePermission(item, 'createUpdate')}
                                                                        onText="Create & Update Access" offText="Create & Update Access"
                                                                    />
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end pb-8 gap-3 border-t border-gray-200 dark:border-white/10 mt-auto pt-6 px-6 bg-white dark:bg-black">
                        <button onClick={() => navigate('/hr/staff-privilege')} className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 font-medium shadow-sm transition-colors text-sm">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm transition-colors disabled:opacity-50 text-sm">
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
