'use client'
import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <SignUp />
    </div>
  )
}
