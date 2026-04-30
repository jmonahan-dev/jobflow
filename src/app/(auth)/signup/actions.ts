"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const businessName = formData.get("businessName") as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }
  if (!data.user) return { error: "Something went wrong" }

  try {
    const business = await prisma.business.create({
      data: { name: businessName }
    })

    await prisma.profile.create({
      data: {
        authUserId: data.user.id,
        businessId: business.id,
        fullName,
        email,
      }
    })
  } catch (err) {
    return { error: "Failed to create account. Please try again." }
  }

  return {}
}