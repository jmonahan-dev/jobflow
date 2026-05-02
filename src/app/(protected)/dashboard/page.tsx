import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to JobFlow</p>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Logged in as: <span className="font-medium">{user.email}</span></p>
        </div>
      </div>
    </div>
  )
}