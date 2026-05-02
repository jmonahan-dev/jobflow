import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"

export default async function CustomerDetailPage({
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

  const customer = await prisma.customer.findFirst({
    where: { id, businessId: profile.businessId },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  })

  if (!customer) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/customers" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to customers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{customer.name}</h1>
        </div>

        <div className="grid gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Details</h2>
            <div className="space-y-3">
              {customer.phone && (
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500 w-20">Phone</span>
                  <span className="text-sm text-gray-900">{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500 w-20">Email</span>
                  <span className="text-sm text-gray-900">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500 w-20">Address</span>
                  <span className="text-sm text-gray-900">{customer.address}</span>
                </div>
              )}
              {customer.notes && (
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500 w-20">Notes</span>
                  <span className="text-sm text-gray-900">{customer.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900">Recent jobs</h2>
              <Link
                href={`/jobs/new?customerId=${customer.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Add job
              </Link>
            </div>
            {customer.jobs.length === 0 ? (
              <p className="text-sm text-gray-500">No jobs yet</p>
            ) : (
              <div className="space-y-3">
                {customer.jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block p-3 rounded-xl border border-gray-100 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <span className="text-xs text-gray-500">{job.status.replace(/_/g, " ")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}