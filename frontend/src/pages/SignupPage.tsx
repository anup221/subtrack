import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, Link } from "react-router-dom"
import { signup } from "@/lib/api"
import { useAppStore } from "@/store/appStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/layout/AuthShell"

const schema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
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
      const res = await signup(data.organizationName, data.email, data.password)
      setSession(res)
      navigate("/dashboard")
    } catch {
      alert("Signup failed — try a different email")
    }
  }

  return (
    <AuthShell
      title="Create your organization"
      subtitle="You'll be the owner. A trial subscription on the Free plan is provisioned automatically."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-[#a78bfa] hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input placeholder="Organization name" {...register("organizationName")} />
        {errors.organizationName && (
          <p className="text-sm text-[#f87171]">{errors.organizationName.message}</p>
        )}
        <Input placeholder="Email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-[#f87171]">{errors.email.message}</p>}
        <Input type="password" placeholder="Password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-sm text-[#f87171]">{errors.password.message}</p>}
        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Creating..." : "Sign up"}
        </Button>
      </form>
    </AuthShell>
  )
}
