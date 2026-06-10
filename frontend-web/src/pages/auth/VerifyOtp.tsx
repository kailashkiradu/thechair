import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Scissors, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function VerifyOtp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const { setAuth } = useAuthStore()
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (!email) {
      toast.error('Missing email parameter')
      navigate('/login')
      return
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, email, navigate])

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      if (data.token) {
        setAuth(data.token, { id: data.id, name: data.name, email: data.email, role: data.role as any })
        toast.success('Account verified successfully!')
        if (data.role === 'OWNER') navigate('/owner/salon')
        else navigate('/salons')
      } else {
        toast.error('Verification succeeded but no session token was returned')
        navigate('/login')
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Verification failed')
    },
  })

  const resendMutation = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: () => {
      toast.success('A new verification code has been sent!')
      setCountdown(30)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resend code')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6 || isNaN(Number(code))) {
      toast.error('Please enter a valid 6-digit verification code')
      return
    }
    verifyMutation.mutate({ email, code })
  }

  const handleResend = () => {
    if (countdown > 0) return
    resendMutation.mutate(email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Scissors className="text-chair-accent" size={24} />
            <span>The<span className="text-chair-accent">Chair</span></span>
          </Link>
          <p className="text-gray-400 mt-3 text-sm">Email Verification</p>
        </div>

        <div className="card border border-chair-border/40">
          <div className="flex justify-center mb-4 text-chair-accent">
            <ShieldCheck size={48} className="animate-pulse" />
          </div>
          
          <h2 className="text-xl font-bold text-center mb-2">Verify Your Email</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            We have sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Verification Code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.trim().slice(0, 6))}
              required
              className="text-center text-2xl tracking-widest font-bold text-white placeholder-gray-700 bg-chair-surface"
              autoFocus
            />

            <Button 
              type="submit" 
              loading={verifyMutation.isPending} 
              className="w-full mt-2"
            >
              Verify Code
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span className="text-gray-400 font-medium">Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-chair-accent hover:underline font-medium focus:outline-none"
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
