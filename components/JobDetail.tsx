"use client"

import { useState } from "react"
import type { Job } from "../types/job"
import { ArrowLeft, MapPin, Calendar, Clock, Building, Users, Bookmark } from "lucide-react"
import { toggleBookmark } from "../services/bookmarks"
import { isAuthenticated } from "../services/auth"

interface JobDetailProps {
  job: Job
  onBack: () => void
  onBookmarkChange?: (jobId: string, isBookmarked: boolean) => void
}

export default function JobDetail({ job, onBack, onBookmarkChange }: JobDetailProps) {
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked || false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [bookmarkError, setBookmarkError] = useState("")

  const handleBookmarkClick = async () => {
    if (!isAuthenticated()) {
      setBookmarkError("Please login to bookmark jobs")
      return
    }

    setBookmarkLoading(true)
    setBookmarkError("")

    try {
      const newBookmarkStatus = await toggleBookmark(job.id, isBookmarked)
      setIsBookmarked(newBookmarkStatus)

      // Notify parent component of bookmark change
      onBookmarkChange?.(job.id, newBookmarkStatus)
    } catch (error) {
      setBookmarkError(error instanceof Error ? error.message : "Failed to update bookmark")
      console.error("Bookmark error:", error)
    } finally {
      setBookmarkLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="job-detail">
      <div className="max-w-6xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to opportunities
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
              {/* Bookmark Button */}
              <button
                onClick={handleBookmarkClick}
                disabled={bookmarkLoading}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                  isBookmarked
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                } ${bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                data-testid="detail-bookmark-button"
                aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? "fill-current" : ""}`} />
              </button>

              {/* Bookmark Error */}
              {bookmarkError && (
                <div className="absolute top-16 right-4 bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-600 z-10">
                  {bookmarkError}
                </div>
              )}

              <div className="flex gap-4 mb-4 pr-12">
                <img
                  src={job.logoUrl || "/placeholder.svg?height=64&width=64&text=Logo"}
                  alt={job.orgName}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=64&width=64&text=Logo"
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="detail-job-title">
                    {job.title}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {job.orgName}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {job.categories?.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {category}
                  </span>
                ))}
                {job.opType && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    {job.opType}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.responsibilities}</div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.requirements}</div>
              </div>
            )}

            {/* Ideal Candidate */}
            {job.idealCandidate && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ideal Candidate</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.idealCandidate}</div>
              </div>
            )}

            {/* When & Where */}
            {job.whenAndWhere && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">When & Where</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.whenAndWhere}</div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <div className="space-y-4">
                {job.datePosted && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Posted On</p>
                      <p className="font-medium">{new Date(job.datePosted).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {job.deadline && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {job.location && job.location.length > 0 && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{job.location.join(", ")}</p>
                    </div>
                  </div>
                )}

                {job.startDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{new Date(job.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {job.endDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{new Date(job.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            {job.categories && job.categories.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {job.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            {job.orgName && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{job.orgName}</p>
                    <p className="text-sm text-gray-600">Organization</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
