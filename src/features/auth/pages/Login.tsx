import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../../store/authStore'
import { Input } from '../../../components/Input'
import { api } from '../../../lib/axios'
import { LogIn } from 'lucide-react'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Login() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await api.post('/auth/login', data)
            const { user, accessToken } = response.data.data

            login({
                id: user.id,
                name: user.name || `${user.firstName} ${user.lastName || ''}`.trim(),
                email: user.email,
                role: user.role?.name || 'Employee',
                permissions: Array.isArray(user.permissions) ? user.permissions : [],
                unitAccess: Array.isArray(user.unitAccess) ? user.unitAccess : [user.unitId].filter(Boolean),
                unitId: user.unitId,
                menuPrivilege: user.menuPrivilege || null
            }, accessToken)

            navigate('/dashboard')
        } catch (error) {
            console.error('Login failed', error)
            alert('Invalid credentials')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl relative z-10 border border-gray-100">
                <div>
                    <div className="mx-auto h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <LogIn className="h-8 w-8 text-primary-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                        Sign in to ERP
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Secure portal for staff & management
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            {...register('password')}
                            error={errors.password?.message}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                role="checkbox"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Authenticating...' : 'Sign in securely'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
