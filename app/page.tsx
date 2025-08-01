"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import JobCard from "../components/JobCard"
import JobDetail from "../components/JobDetail"
import BookmarkedJobs from "../components/BookmarkedJobs"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { fetchOpportunities, fetchOpportunityById } from "../services/api"
import { isAuthenticated, getUserData, logout } from "../services/auth"
import type { User } from "../types/auth"
import { getBookmarks } from "../services/bookmarks"
import type { Job } from "../types/job"

export default function JobListingApp() {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "bookmarked">("all")
  const [sortBy, setSortBy] = useState("Most relevant")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobLoading, setSelectedJobLoading] = useState(false)
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(new Set())

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setIsAuth(true)
        setUser(getUserData())
      } else {
        router.push("/auth/signin")
      }
    }

    checkAuth()
  }, [router])

  // Load bookmarked job IDs
  useEffect(() => {
    const loadBookmarkedIds = async () => {
      if (isAuth) {
        try {
          const bookmarks = await getBookmarks()
          const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.eventID))
          setBookmarkedJobIds(bookmarkedIds)
        } catch (error) {
          console.error("Error loading bookmarked IDs:", error)
        }
      }
    }

    loadBookmarkedIds()
  }, [isAuth])

  // Load opportunities
  useEffect(() => {
    const loadOpportunities = async () => {
      if (!isAuth) return

      try {
        setLoading(true)
        setError(null)

        let data: Job[]
        data = await fetchOpportunities()

        // Mark jobs as bookmarked based on bookmarkedJobIds
        const jobsWithBookmarkStatus = data.map((job) => ({
          ...job,
          isBookmarked: bookmarkedJobIds.has(job.id),
        }))

        setJobs(jobsWithBookmarkStatus)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch opportunities")
        console.error("Error fetching opportunities:", err)
      } finally {
        setLoading(false)
      }
    }

    loadOpportunities()
  }, [isAuth, bookmarkedJobIds])

  // Handle job card click - fetch detailed job data
  const handleJobClick = async (jobId: string) => {
    try {
      setSelectedJobLoading(true)
      setError(null)
      const detailedJob = await fetchOpportunityById(jobId)
      // Add bookmark status to detailed job
      detailedJob.isBookmarked = bookmarkedJobIds.has(jobId)
      setSelectedJob(detailedJob)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job details")
      console.error("Error fetching job details:", err)
    } finally {
      setSelectedJobLoading(false)
    }
  }

  // Handle back navigation from job detail
  const handleBack = () => {
    setSelectedJob(null)
    setError(null)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    router.push("/auth/signin")
  }

  // Handle bookmark change
  const handleBookmarkChange = (jobId: string, isBookmarked: boolean) => {
    setBookmarkedJobIds((prev) => {
      const newSet = new Set(prev)
      if (isBookmarked) {
        newSet.add(jobId)
      } else {
        newSet.delete(jobId)
      }
      return newSet
    })

    // Update jobs list
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, isBookmarked } : job)))

    // Update selected job if it's the same job
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, isBookmarked } : null))
    }
  }

  // Show job detail page if a job is selected
  if (selectedJob) {
    return <JobDetail job={selectedJob} onBack={handleBack} onBookmarkChange={handleBookmarkChange} />
  }

  // Show loading spinner while checking auth or fetching data
  if (loading || !isAuth) {
    return <LoadingSpinner message="Loading opportunities..." />
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="job-listing-app">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunities</h1>
            <p className="text-gray-600">
              {activeTab === "all" ? `Showing ${jobs.length} results` : "Your bookmarked jobs"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              data-testid="logout-button"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            data-testid="all-jobs-tab"
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("bookmarked")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "bookmarked" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            data-testid="bookmarked-jobs-tab"
          >
            Bookmarked ({bookmarkedJobIds.size})
          </button>
        </div>

        {/* Sort Options (only for all jobs) */}
        {activeTab === "all" && (
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="sort-select"
              >
                <option>Most relevant</option>
                <option>Newest first</option>
                <option>Oldest first</option>
              </select>
            </div>
          </div>
        )}

        {/* Error message for job selection */}
        {error && selectedJobLoading && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Loading indicator for job selection */}
        {selectedJobLoading && (
          <div className="mb-4">
            <LoadingSpinner message="Loading job details..." />
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "all" ? (
          <>
            {/* Job Cards */}
            <div className="space-y-4" data-testid="job-cards-container">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => handleJobClick(job.id)}
                  disabled={selectedJobLoading}
                  onBookmarkChange={handleBookmarkChange}
                />
              ))}
            </div>

            {/* Empty state for no jobs */}
            {jobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No opportunities found</p>
              </div>
            )}
          </>
        ) : (
          <BookmarkedJobs onJobClick={handleJobClick} />
        )}

        {/* Error state */}
        {error && jobs.length === 0 && !selectedJobLoading && (
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        )}
      </div>
    </div>
  )
}
