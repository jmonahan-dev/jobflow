"use client"

import { useState } from "react"
import Link from "next/link"
import { updateJobStatus, toggleJobPaid, addJobNote } from "./actions"

const STATUS_OPTIONS = [
  { value: "NEW_LEAD", label: "New lead" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUOTE_SENT", label: "Quote sent" },
  { value: "BOOKED", label: "Booked" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
]

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

interface Job {
  id: string
  title: string
  description: string | null
  status: string
  isPaid: boolean
  scheduledDate: string | null
  scheduledTime: string | null
  location: string | null
  price: number | null
  customer: { id: string; name: string }
  jobNotes: { id: string; note: string; createdAt: string }[]
}

export default function JobDetail({ job }: { job: Job }) {
  const [status, setStatus] = useState(job.status)
  const [isPaid, setIsPaid] = useState(job.isPaid)
  const [note, setNote] = useState("")
  const [notes, setNotes] = useState(job.jobNotes)
  const [saving, setSaving] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus)
    await updateJobStatus(job.id, newStatus)
  }

  async function handleTogglePaid() {
    const newValue = !isPaid
    setIsPaid(newValue)
    await toggleJobPaid(job.id, newValue)
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)

    const result = await addJobNote(job.id, note)
    if (!result.error) {
      setNotes([...notes, {
        id: Date.now().toString(),
        note,
        createdAt: new Date().toISOString(),
      }])
      setNote("")
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/jobs" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to jobs
          </Link>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
              {STATUS_OPTIONS.find(s => s.value === status)?.label}
            </span>
          </div>
          <Link href={`/customers/${job.customer.id}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">
            {job.customer.name}
          </Link>
        </div>

        <div className="grid gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Job details</h2>
            <div className="space-y-3">
              {job.description && (
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500 w-24">Description</span>
                  <span className="text-sm text-gray-900">{job.description}</span>
                </div>
              )}
              {job.scheduledDate && (
                <div className="flex gap-3">
                    <span className="text-sm text-gray-500 w-24">Date</span>
                    <span className="text-sm text-gray-900">
                    {new Date(job.scheduledDate).toLocaleDateString("en-IE")}
                    {job.scheduledTime && ` at ${job.scheduledTime}`}
                    </span>
                </div>
                )}
              {job.location && (
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500 w-24">Location</span>
                  <span className="text-sm text-gray-900">{job.location}</span>
                </div>
              )}
              {job.price && (
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500 w-24">Price</span>
                  <span className="text-sm text-gray-900">€{Number(job.price).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Update status</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                    status === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-gray-900">Payment</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isPaid ? "Marked as paid" : "Not yet paid"}
                </p>
              </div>
              <button
                onClick={handleTogglePaid}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isPaid
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isPaid ? "Paid" : "Mark as paid"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Notes</h2>

            {notes.length > 0 && (
              <div className="space-y-3 mb-4">
                {notes.map((n) => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-900">{n.note}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString("en-IE")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              />
              <button
                type="submit"
                disabled={saving || !note.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {saving ? "..." : "Add"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}