"use client";

import type React from "react";

import { useState } from "react";
import type { Job } from "../types/job";
import { MapPin, Calendar, Clock, Bookmark } from "lucide-react";
import { toggleBookmark } from "../services/bookmarks";
import { isAuthenticated } from "../services/auth";

interface JobCardProps {
  job: Job;
  onClick: () => void;
  disabled?: boolean;
  onBookmarkChange?: (jobId: string, isBookmarked: boolean) => void;
}

export default function JobCard({
  job,
  onClick,
  disabled = false,
  onBookmarkChange,
}: JobCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking bookmark

    if (!isAuthenticated()) {
      setBookmarkError("Please login to bookmark jobs");
      return;
    }

    setBookmarkLoading(true);
    setBookmarkError("");

    try {
      const newBookmarkStatus = await toggleBookmark(job.id, isBookmarked);
      setIsBookmarked(newBookmarkStatus);

      // Notify parent component of bookmark change
      onBookmarkChange?.(job.id, newBookmarkStatus);
    } catch (error) {
      setBookmarkError(
        error instanceof Error ? error.message : "Failed to update bookmark"
      );
      console.error("Bookmark error:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 transition-all relative ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md cursor-pointer hover:border-blue-200"
      }`}
      onClick={disabled ? undefined : onClick}
      data-testid="job-card"
    >
      {/* Bookmark Button */}
      <button
        onClick={handleBookmarkClick}
        disabled={bookmarkLoading}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
          isBookmarked
            ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
            : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        } ${bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        data-testid="bookmark-btn"
        aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      >
        <Bookmark
          className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
          data-testid="bookmark-icon"
        />
      </button>

      {/* Bookmark Error */}
      {bookmarkError && (
        <div className="absolute top-16 right-4 bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-600 z-10">
          {bookmarkError}
        </div>
      )}

      <div className="flex gap-4 pr-12">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={job.logoUrl || "/placeholder.svg?height=48&width=48&text=Logo"}
            alt={job.orgName}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
            data-testid="company-logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg?height=48&width=48&text=Logo";
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              data-testid="job-title"
            >
              {job.title}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="font-medium" data-testid="company-name">
              {job.orgName}
            </span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span data-testid="job-location">
                {job.location?.join(", ") || "Location not specified"}
              </span>
            </div>
          </div>

          <p
            className="text-gray-700 mb-4 line-clamp-3"
            data-testid="job-description"
          >
            {job.description}
          </p>

          {/* Categories/Tags */}
          <div
            className="flex gap-2 mb-4 flex-wrap"
            data-testid="job-categories"
          >
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

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Posted{" "}
                  {job.datePosted
                    ? new Date(job.datePosted).toLocaleDateString()
                    : "Recently"}
                </span>
              </div>
              {job.deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Deadline {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
