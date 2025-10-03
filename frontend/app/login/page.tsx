import { LoginForm } from "@/app/components/form/login/LoginForm"
import { Login05 } from "@/components/features/blocks/Login05"

export default function LoginPage() {
  return (
    <Login05 title="Connexion" subtitle="Entrez vos identifiants pour continuer.">
      <LoginForm />
    </Login05>
  )
}
