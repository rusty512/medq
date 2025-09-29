import Link from "next/link"


export function Logout({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/login">{children}</Link>
  )
}