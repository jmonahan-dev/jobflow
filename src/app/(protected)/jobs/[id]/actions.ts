"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateJobStatus(jobId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) return { error: "Profile not found" }

  await prisma.job.updateMany({
    where: { id: jobId, businessId: profile.businessId },
    data: { status: status as any }
  })

  revalidatePath(`/jobs/${jobId}`)
  return {}
}

export async function toggleJobPaid(jobId: string, isPaid: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) return { error: "Profile not found" }

  await prisma.job.updateMany({
    where: { id: jobId, businessId: profile.businessId },
    data: { isPaid }
  })

  revalidatePath(`/jobs/${jobId}`)
  return {}
}

export async function addJobNote(jobId: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) return { error: "Profile not found" }

  await prisma.jobNote.create({
    data: {
      jobId,
      profileId: profile.id,
      note,
    }
  })

  revalidatePath(`/jobs/${jobId}`)
  return {}
}