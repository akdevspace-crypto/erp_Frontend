import { useState } from 'react'
import { AlertTriangle, Plus, Activity } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { api } from '../../../lib/axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../components/Toast'

const useUecIncidents = () => {
    return useQuery({
        queryKey: ['uec-incidents'],
        queryFn: async () => {
            const res = await api.get('/uec/incidents')
            return res.data.data || []
        }
    })
}

const useReportIncident = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.post('/uec/incidents', payload)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['uec-incidents'] })
            toast({ type: 'success', title: 'Reported', message: 'Incident reported successfully' })
        }
    })
}

export function IncidentReports() {
    const { data: incidents = [], isLoading } = useUecIncidents()
    const reportIncident = useReportIncident()
    
    // Form state
    const [patientId, setPatientId] = useState('123e4567-e89b-12d3-a456-426614174000') // Placeholder UUID
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(new Date().toISOString().substring(0, 16))
    const [severity, setSeverity] = useState('MEDIUM')
    const [witnesses, setWitnesses] = useState('')
    const [actionTaken, setActionTaken] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        reportIncident.mutate({
            patientId, title, description, date, severity, witnesses, actionTaken
        }, {
            onSuccess: () => {
                setTitle('')
                setDescription('')
                setWitnesses('')
                setActionTaken('')
                setSeverity('MEDIUM')
            }
        })
    }

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30'
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/30'
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30'
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/30'
        }
    }

    return (
        <div className="w-full min-w-0 space-y-4 px-2 pb-6 sm:px-4 2xl:px-6">
            <PageHeader
                title="Incident Reports"
                subtitle="Log falls, behavioral issues, or other non-clinical incidents for residents."
                breadcrumbs={[{ label: 'UEC' }, { label: 'In-House Care' }, { label: 'Incident Reports' }]}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black">
                    <div>
                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" /> Report Incident
                        </h2>
                        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">File a new incident report. Critical incidents will be routed to Admin for review.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">Patient ID</label>
                            <input
                                type="text"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">Incident Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                required
                                placeholder="e.g. Fall in hallway"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">Severity</label>
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical (Requires Review)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">Description of Event</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">Immediate Action Taken</label>
                            <textarea
                                value={actionTaken}
                                onChange={(e) => setActionTaken(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                rows={2}
                                placeholder="e.g. First aid administered, vitals checked"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">Witnesses (if any)</label>
                            <input
                                type="text"
                                value={witnesses}
                                onChange={(e) => setWitnesses(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                placeholder="Names of staff or residents present"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={reportIncident.isPending}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Submit Report
                    </button>
                </form>

                <div className="space-y-6 rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black">
                    <div>
                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">Recent Incident Log</h2>
                        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">Chronological history of reported incidents.</p>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <p className="text-sm text-gray-500">Loading incidents...</p>
                        ) : incidents.length === 0 ? (
                            <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg dark:border-white/10">
                                <Activity className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                                <p className="mt-4 text-sm font-bold text-gray-400">No incidents reported.</p>
                            </div>
                        ) : (
                            incidents.map((incident: any) => (
                                <div key={incident.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                                            {incident.patientName}
                                        </p>
                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${getSeverityColor(incident.severity)}`}>
                                            {incident.severity}
                                        </span>
                                    </div>
                                    <h4 className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200">{incident.title}</h4>
                                    <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{incident.description}</p>
                                    
                                    {incident.actionTaken && (
                                        <div className="mt-2 text-xs">
                                            <strong className="text-gray-700 dark:text-gray-300">Action: </strong> 
                                            <span className="text-gray-600 dark:text-gray-400">{incident.actionTaken}</span>
                                        </div>
                                    )}

                                    <p className="mt-3 text-[11px] font-bold text-gray-400">{new Date(incident.date).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
