import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Nav from "@/components/nav"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id },
    include: { business: true }
  })

  if (!profile) redirect("/login")

  return (
    <div>
      <Nav businessName={profile.business.name} />
      <main>{children}</main>
    </div>
  )
}