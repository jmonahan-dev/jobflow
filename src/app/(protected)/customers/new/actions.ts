"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) return { error: "Profile not found" }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string
  const notes = formData.get("notes") as string

  if (!name) return { error: "Name is required" }

  await prisma.customer.create({
    data: {
      businessId: profile.businessId,
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
    }
  })

  redirect("/customers")
}