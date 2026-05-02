import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import NewJobForm from "./_form"

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>
}) {
  const { customerId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) redirect("/login")

  const customers = await prisma.customer.findMany({
    where: { businessId: profile.businessId },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  })

  return <NewJobForm customers={customers} preselectedCustomerId={customerId || ""} />
}