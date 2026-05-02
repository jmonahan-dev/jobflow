import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id },
    include: { business: true }
  })

  if (!profile) redirect("/login")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const [
    totalCustomers,
    todaysJobs,
    upcomingJobs,
    unpaidJobs,
    recentJobs,
  ] = await Promise.all([
    prisma.customer.count({
      where: { businessId: profile.businessId }
    }),
    prisma.job.findMany({
      where: {
        businessId: profile.businessId,
        scheduledDate: { gte: today, lt: tomorrow }
      },
      include: { customer: { select: { name: true } } },
      orderBy: { scheduledTime: "asc" }
    }),
    prisma.job.findMany({
      where: {
        businessId: profile.businessId,
        scheduledDate: { gte: tomorrow, lt: nextWeek },
        status: { notIn: ["COMPLETED", "PAID", "CANCELLED"] }
      },
      include: { customer: { select: { name: true } } },
      orderBy: { scheduledDate: "asc" }
    }),
    prisma.job.count({
      where: {
        businessId: profile.businessId,
        isPaid: false,
        status: { in: ["COMPLETED", "PAID"] }
      }
    }),
    prisma.job.findMany({
      where: { businessId: profile.businessId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.business.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {today.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/customers/new"
              className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium rounded-xl transition-colors"
            >
              Add customer
            </Link>
            <Link
              href="/jobs/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Add job
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <Link href="/customers" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 transition-colors">
            <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">Customers</p>
          </Link>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-3xl font-bold text-gray-900">{todaysJobs.length}</p>
            <p className="text-sm text-gray-500 mt-1">Jobs today</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-3xl font-bold text-gray-900">{upcomingJobs.length}</p>
            <p className="text-sm text-gray-500 mt-1">Upcoming</p>
          </div>
          <Link href="/jobs" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-red-300 transition-colors">
            <p className={`text-3xl font-bold ${unpaidJobs > 0 ? "text-red-600" : "text-gray-900"}`}>
              {unpaidJobs}
            </p>
            <p className="text-sm text-gray-500 mt-1">Unpaid jobs</p>
          </Link>
        </div>

        {todaysJobs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Today
            </h2>
            <div className="space-y-3">
              {todaysJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.customer.name}
                        {job.scheduledTime && ` · ${job.scheduledTime}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                      {STATUS_LABELS[job.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {upcomingJobs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Upcoming this week
            </h2>
            <div className="space-y-3">
              {upcomingJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.customer.name}
                        {job.scheduledDate && ` · ${new Date(job.scheduledDate).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                      {STATUS_LABELS[job.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Recent jobs
          </h2>
          {recentJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-sm">No jobs yet</p>
              <Link href="/jobs/new" className="inline-block mt-3 text-blue-600 hover:underline text-sm font-medium">
                Add your first job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{job.customer.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!job.isPaid && job.status === "COMPLETED" && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                          Unpaid
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                        {STATUS_LABELS[job.status]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 flex gap-6">
          <Link href="/customers" className="text-sm text-gray-500 hover:text-gray-700">
            Customers
          </Link>
          <Link href="/jobs" className="text-sm text-gray-500 hover:text-gray-700">
            Jobs
          </Link>
        </div>

      </div>
    </div>
  )
}