import { Mail, MessageSquare, Phone } from 'lucide-react'
import { cn } from '../../../lib/utils'

export const getChannelMeta = (channel?: string) => {
    const normalized = String(channel || 'whatsapp').trim().toLowerCase()

    if (normalized === 'email') {
        return {
            value: 'email',
            label: 'Email',
            badgeClassName: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
            dotClassName: 'bg-sky-500',
            surfaceClassName: 'border-sky-200/80 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/5',
            accentClassName: 'text-sky-600 dark:text-sky-300'
        }
    }

    if (normalized === 'internal') {
        return {
            value: 'internal',
            label: 'Internal',
            badgeClassName: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200',
            dotClassName: 'bg-slate-500',
            surfaceClassName: 'border-slate-200/80 bg-slate-50/80 dark:border-slate-500/20 dark:bg-slate-500/5',
            accentClassName: 'text-slate-600 dark:text-slate-300'
        }
    }

    if (normalized === 'call') {
        return {
            value: 'call',
            label: 'Call',
            badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
            dotClassName: 'bg-amber-500',
            surfaceClassName: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/5',
            accentClassName: 'text-amber-600 dark:text-amber-300'
        }
    }

    if (normalized === 'sms') {
        return {
            value: 'sms',
            label: 'SMS',
            badgeClassName: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
            dotClassName: 'bg-violet-500',
            surfaceClassName: 'border-violet-200/80 bg-violet-50/70 dark:border-violet-500/20 dark:bg-violet-500/5',
            accentClassName: 'text-violet-600 dark:text-violet-300'
        }
    }

    return {
        value: 'whatsapp',
        label: 'WhatsApp',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
        dotClassName: 'bg-emerald-500',
        surfaceClassName: 'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5',
        accentClassName: 'text-emerald-600 dark:text-emerald-300'
    }
}

type ChannelBadgeProps = {
    channel?: string
    className?: string
}

export function ChannelBadge({ channel, className }: ChannelBadgeProps) {
    const meta = getChannelMeta(channel)

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
                meta.badgeClassName,
                className
            )}
        >
            {meta.value === 'email' ? (
                <Mail className="h-3 w-3" />
            ) : meta.value === 'call' ? (
                <Phone className="h-3 w-3" />
            ) : meta.value === 'sms' ? (
                <MessageSquare className="h-3 w-3" />
            ) : (
                <span className={cn('h-2 w-2 rounded-full', meta.dotClassName)} />
            )}
            <span>{meta.label}</span>
        </span>
    )
}
