"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import JobCard from "../../components/JobCard"
import { toggleBookmark } from "../../services/bookmarks"
import { isAuthenticated } from "../../services/auth"
import type { Job } from "../../types/job"
import { jest } from "@jest/globals"

// Mock the services
jest.mock("../../services/bookmarks")
jest.mock("../../services/auth")

const mockToggleBookmark = toggleBookmark as jest.MockedFunction<typeof toggleBookmark>
const mockIsAuthenticated = isAuthenticated as jest.MockedFunction<typeof isAuthenticated>

const mockJob: Job = {
  id: "1",
  title: "Software Engineer",
  orgName: "Tech Company",
  location: ["San Francisco", "CA"],
  description: "A great software engineering position",
  logoUrl: "https://example.com/logo.png",
  categories: ["Engineering", "Full-time"],
  opType: "Full-time",
  datePosted: "2023-01-01",
  deadline: "2023-12-31",
  isBookmarked: false,
}

describe("JobCard", () => {
  const mockOnClick = jest.fn()
  const mockOnBookmarkChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAuthenticated.mockReturnValue(true)
  })

  it("renders job card with correct information", () => {
    render(<JobCard job={mockJob} onClick={mockOnClick} />)

    expect(screen.getByTestId("job-title")).toHaveTextContent("Software Engineer")
    expect(screen.getByTestId("company-name")).toHaveTextContent("Tech Company")
    expect(screen.getByTestId("job-location")).toHaveTextContent("San Francisco, CA")
    expect(screen.getByTestId("job-description")).toHaveTextContent("A great software engineering position")
  })

  it("displays bookmark button", () => {
    render(<JobCard job={mockJob} onClick={mockOnClick} />)

    const bookmarkButton = screen.getByTestId("bookmark-button")
    expect(bookmarkButton).toBeInTheDocument()
    expect(bookmarkButton).toHaveAttribute("aria-label", "Add to bookmarks")
  })

  it("shows bookmarked state when job is bookmarked", () => {
    const bookmarkedJob = { ...mockJob, isBookmarked: true }
    render(<JobCard job={bookmarkedJob} onClick={mockOnClick} />)

    const bookmarkButton = screen.getByTestId("bookmark-button")
    expect(bookmarkButton).toHaveAttribute("aria-label", "Remove from bookmarks")
    expect(bookmarkButton).toHaveClass("bg-blue-100", "text-blue-600")
  })

  it("calls onClick when card is clicked", () => {
    render(<JobCard job={mockJob} onClick={mockOnClick} />)

    const jobCard = screen.getByTestId("job-card")
    fireEvent.click(jobCard)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it("handles bookmark toggle successfully", async () => {
    mockToggleBookmark.mockResolvedValue(true)

    render(<JobCard job={mockJob} onClick={mockOnClick} onBookmarkChange={mockOnBookmarkChange} />)

    const bookmarkButton = screen.getByTestId("bookmark-button")
    fireEvent.click(bookmarkButton)

    await waitFor(() => {
      expect(mockToggleBookmark).toHaveBeenCalledWith("1", false)
      expect(mockOnBookmarkChange).toHaveBeenCalledWith("1", true)
    })
  })

  it("shows error when user is not authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(false)

    render(<JobCard job={mockJob} onClick={mockOnClick} />)

    const bookmarkButton = screen.getByTestId("bookmark-button")
    fireEvent.click(bookmarkButton)

    await waitFor(() => {
      expect(screen.getByText("Please login to bookmark jobs")).toBeInTheDocument()
    })
  })
})
