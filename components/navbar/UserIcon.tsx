'use client'

import { LuUser } from 'react-icons/lu'
import { useUser } from '@clerk/nextjs'
import React from 'react'

function UserIcon() {
  const { user } = useUser()
  const profileImage = user?.imageUrl

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt="User profile"
        className="w-6 h-6 rounded-full object-cover"
      />
    )
  }
  return <LuUser className="w-6 h-6 bg-primary rounded-full text-white" />
}

export default UserIcon
