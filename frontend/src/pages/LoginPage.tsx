import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { login } from "@/lib/api"
import { useAppStore } from "@/store/appStore"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-screen flex items-center justify-center">
      <Card className="glow-border w-96 space-y-4">
        <h1 className="text-xl font-semibold">Log in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
          <Input type="password" placeholder="Password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </Card>
    </div>
  )
}