import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.token, { id: data.id, name: data.name, email: data.email, role: data.role })
      toast.success(`Welcome back, ${data.name}!`)
      if (data.role === 'ADMIN') navigate('/admin')
      else if (data.role === 'OWNER') navigate('/owner')
      else navigate('/salons')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Login failed')
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Scissors className="text-chair-accent" size={24} />
            <span>The<span className="text-chair-accent">Chair</span></span>
          </Link>
          <p className="text-gray-400 mt-3 text-sm">Sign in to your account</p>
        </div>

        <div className="card">
          <form
            onSubmit={(e) => { e.preventDefault(); mutate(form) }}
            className="flex flex-col gap-4"
          >
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <Button type="submit" loading={isPending} className="w-full mt-2">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-chair-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
