import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

const STATUS_LABELS: Record<string, string> = {
  NEW_LEAD: "New lead",
  CONTACTED: "Contacted",
  QUOTE_SENT: "Quote sent",
  BOOKED: "Booked",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  PAID: "Paid",
  CANCELLED: "Cancelled",
}

const STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  QUOTE_SENT: "bg-purple-100 text-purple-700",
  BOOKED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  })

  if (!profile) redirect("/login")

  const jobs = await prisma.job.findMany({
    where: { businessId: profile.businessId },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-500 text-sm mt-1">{jobs.length} total</p>
          </div>
          <Link
            href="/jobs/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Add job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No jobs yet</p>
            <Link
              href="/jobs/new"
              className="inline-block mt-4 text-blue-600 hover:underline font-medium"
            >
              Add your first job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                        {STATUS_LABELS[job.status]}
                      </span>
                      {!job.isPaid && job.status === "COMPLETED" && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                          Unpaid
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1">
                      <p className="text-sm text-gray-500">{job.customer.name}</p>
                      {job.scheduledDate && (
                        <p className="text-sm text-gray-500">
                          {new Date(job.scheduledDate).toLocaleDateString("en-IE")}
                        </p>
                      )}
                      {job.price && (
                        <p className="text-sm text-gray-500">€{Number(job.price).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}