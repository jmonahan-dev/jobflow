import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import JobDetail from "./_detail"

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) redirect("/login")

  const job = await prisma.job.findFirst({
    where: { id, businessId: profile.businessId },
    include: {
      customer: { select: { id: true, name: true } },
      jobNotes: { orderBy: { createdAt: "desc" } }
    }
  })

  if (!job) notFound()

  const serializedJob = {
    ...job,
    price: job.price ? Number(job.price) : null,
    scheduledDate: job.scheduledDate ? job.scheduledDate.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    jobNotes: job.jobNotes.map(note => ({
      ...note,
      createdAt: note.createdAt.toISOString(),
    }))
  }

  return <JobDetail job={serializedJob} />
}