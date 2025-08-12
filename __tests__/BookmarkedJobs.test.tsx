import { render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import BookmarkedJobs from "../../components/BookmarkedJobs"
import { getBookmarks } from "../../services/bookmarks"
import { fetchOpportunityById } from "../../services/api"
import jest from "jest" // Declare the jest variable

// Mock the services
jest.mock("../../services/bookmarks")
jest.mock("../../services/api")

const mockGetBookmarks = getBookmarks as jest.MockedFunction<typeof getBookmarks>
const mockFetchOpportunityById = fetchOpportunityById as jest.MockedFunction<typeof fetchOpportunityById>

const mockBookmarks = [
  {
    eventID: "1",
    dateBookmarked: "2023-01-01",
    datePosted: "2023-01-01",
    logoUrl: "https://example.com/logo.png",
    opType: "Full-time",
    orgName: "Tech Company",
    title: "Software Engineer",
    location: ["San Francisco", "CA"],
  },
]

const mockJob = {
  id: "1",
  title: "Software Engineer",
  orgName: "Tech Company",
  location: ["San Francisco", "CA"],
  description: "A great software engineering position",
  logoUrl: "https://example.com/logo.png",
  categories: ["Engineering"],
  opType: "Full-time",
  datePosted: "2023-01-01",
  deadline: "2023-12-31",
  isBookmarked: true,
}

describe("BookmarkedJobs", () => {
  const mockOnJobClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("displays loading state initially", () => {
    mockGetBookmarks.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<BookmarkedJobs onJobClick={mockOnJobClick} />)

    expect(screen.getByText("Loading bookmarked jobs...")).toBeInTheDocument()
  })

  it("displays bookmarked jobs when loaded successfully", async () => {
    mockGetBookmarks.mockResolvedValue(mockBookmarks)
    mockFetchOpportunityById.mockResolvedValue(mockJob)

    render(<BookmarkedJobs onJobClick={mockOnJobClick} />)

    await waitFor(() => {
      expect(screen.getByTestId("bookmarked-jobs-list")).toBeInTheDocument()
      expect(screen.getByText("Software Engineer")).toBeInTheDocument()
    })
  })

  it("displays empty state when no bookmarks exist", async () => {
    mockGetBookmarks.mockResolvedValue([])

    render(<BookmarkedJobs onJobClick={mockOnJobClick} />)

    await waitFor(() => {
      expect(screen.getByTestId("no-bookmarks")).toBeInTheDocument()
      expect(screen.getByText("No bookmarked jobs")).toBeInTheDocument()
      expect(screen.getByText("Start bookmarking jobs to see them here")).toBeInTheDocument()
    })
  })

  it("displays error state when loading fails", async () => {
    mockGetBookmarks.mockRejectedValue(new Error("Failed to load bookmarks"))

    render(<BookmarkedJobs onJobClick={mockOnJobClick} />)

    await waitFor(() => {
      expect(screen.getByText("Failed to load bookmarks")).toBeInTheDocument()
    })
  })

  it("removes job from list when unbookmarked", async () => {
    mockGetBookmarks.mockResolvedValue(mockBookmarks)
    mockFetchOpportunityById.mockResolvedValue(mockJob)

    const { rerender } = render(<BookmarkedJobs onJobClick={mockOnJobClick} />)

    await waitFor(() => {
      expect(screen.getByText("Software Engineer")).toBeInTheDocument()
    })

    // Simulate unbookmarking by re-rendering with empty bookmarks
    mockGetBookmarks.mockResolvedValue([])
    rerender(<BookmarkedJobs onJobClick={mockOnJobClick} />)

    await waitFor(() => {
      expect(screen.getByTestId("no-bookmarks")).toBeInTheDocument()
    })
  })
})
