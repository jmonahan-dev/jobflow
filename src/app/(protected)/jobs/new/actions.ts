"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) return { error: "Profile not found" }

  const customerId = formData.get("customerId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const scheduledDate = formData.get("scheduledDate") as string
  const scheduledTime = formData.get("scheduledTime") as string
  const location = formData.get("location") as string
  const price = formData.get("price") as string

  if (!customerId) return { error: "Customer is required" }
  if (!title) return { error: "Title is required" }

  await prisma.job.create({
    data: {
      businessId: profile.businessId,
      customerId,
      title,
      description: description || null,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime: scheduledTime || null,
      location: location || null,
      price: price ? parseFloat(price) : null,
      status: "NEW_LEAD",
    }
  })

  redirect("/jobs")
}