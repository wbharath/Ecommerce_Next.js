'use client'
import { SignOutButton } from '@clerk/nextjs'
import { toast } from 'sonner' 
import Link from 'next/link'

function SignOutLink() {
  const handleLogout = () => {
    toast.success('Logging Out...') 
  }

  return (
    <SignOutButton>
      <Link href="/" className="w-full text-left" onClick={handleLogout}>
        Logout
      </Link>
    </SignOutButton>
  )
}

export default SignOutLink
