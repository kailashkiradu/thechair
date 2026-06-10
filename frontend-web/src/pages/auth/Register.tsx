import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'CUSTOMER',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.otpRequired) {
        toast.success('Account registered! Code sent to email.')
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`)
      } else {
        setAuth(data.token!, { id: data.id, name: data.name, email: data.email, role: data.role as any })
        toast.success('Account created!')
        if (data.role === 'OWNER') navigate('/owner/salon')
        else navigate('/salons')
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed')
    },
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Scissors className="text-chair-accent" size={24} />
            <span>The<span className="text-chair-accent">Chair</span></span>
          </Link>
          <p className="text-gray-400 mt-3 text-sm">Create your account</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="flex gap-2 mb-5 p-1 bg-chair-surface rounded-lg">
            {['CUSTOMER', 'OWNER'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r }))}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors
                  ${form.role === r ? 'bg-chair-accent text-black' : 'text-gray-400 hover:text-white'}`}
              >
                {r === 'CUSTOMER' ? 'Customer' : 'Salon Owner'}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); mutate(form) }}
            className="flex flex-col gap-4"
          >
            <Input label="Full Name" placeholder="Your name" value={form.name} onChange={set('name')} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            <Input label="Phone" type="tel" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
            <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
            <Button type="submit" loading={isPending} className="w-full mt-2">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-chair-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
