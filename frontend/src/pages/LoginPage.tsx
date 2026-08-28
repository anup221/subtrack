import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, Link } from "react-router-dom"
import { login } from "@/lib/api"
import { useAppStore } from "@/store/appStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/layout/AuthShell"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAppStore((s) => s.setSession)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data.email, data.password)
      setSession(res)
      navigate("/dashboard")
    } catch {
      alert("Invalid email or password")
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Access your organization's billing workspace."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="text-[#a78bfa] hover:underline">
            Create an organization
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input placeholder="Email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-[#f87171]">{errors.email.message}</p>}
        <Input type="password" placeholder="Password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-sm text-[#f87171]">{errors.password.message}</p>}
        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthShell>
  )
}
