"use client"

import { useState, useEffect } from "react"
import { getBookmarks } from "../services/bookmarks"
import { fetchOpportunityById } from "../services/api"
import JobCard from "./JobCard"
import LoadingSpinner from "./LoadingSpinner"
import ErrorMessage from "./ErrorMessage"
import type { Job } from "../types/job"

interface BookmarkedJobsProps {
  onJobClick: (jobId: string) => void
}

export default function BookmarkedJobs({ onJobClick }: BookmarkedJobsProps) {
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBookmarkedJobs()
  }, [])

  const loadBookmarkedJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      const bookmarks = await getBookmarks()

      // Fetch detailed job information for each bookmark
      const jobPromises = bookmarks.map((bookmark) => fetchOpportunityById(bookmark.eventID))
      const jobs = await Promise.all(jobPromises)

      // Mark jobs as bookmarked
      const bookmarkedJobsWithStatus = jobs.map((job) => ({ ...job, isBookmarked: true }))

      setBookmarkedJobs(bookmarkedJobsWithStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookmarked jobs")
      console.error("Error loading bookmarked jobs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmarkChange = (jobId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      // Remove job from bookmarked list
      setBookmarkedJobs((prev) => prev.filter((job) => job.id !== jobId))
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading bookmarked jobs..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadBookmarkedJobs} />
  }

  if (bookmarkedJobs.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-bookmarks">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarked jobs</h3>
        <p className="text-gray-500">Start bookmarking jobs to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="bookmarked-jobs-list">
      {bookmarkedJobs.map((job) => (
        <JobCard key={job.id} job={job} onClick={() => onJobClick(job.id)} onBookmarkChange={handleBookmarkChange} />
      ))}
    </div>
  )
}
