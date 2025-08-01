import { getBookmarks, toggleBookmark } from "../../services/bookmarks"
import { getAccessToken } from "../../services/auth"
import jest from "jest" // Import jest to declare the variable

// Mock the auth service
jest.mock("../../services/auth")

const mockGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe("Bookmark Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAccessToken.mockReturnValue("mock-token")
  })

  describe("getBookmarks", () => {
    it("fetches bookmarks successfully", async () => {
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockBookmarks,
        }),
      } as Response)

      const result = await getBookmarks()

      expect(result).toEqual(mockBookmarks)
      expect(mockFetch).toHaveBeenCalledWith("https://akil-backend.onrender.com/bookmarks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
      })
    })

    it("throws error when not authenticated", async () => {
      mockGetAccessToken.mockReturnValue(null)

      await expect(getBookmarks()).rejects.toThrow("Authentication required")
    })
  })

  describe("toggleBookmark", () => {
    it("adds bookmark when currently not bookmarked", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
        }),
      } as Response)

      const result = await toggleBookmark("job-1", false)

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        "https://akil-backend.onrender.com/bookmarks/job-1",
        expect.objectContaining({
          method: "POST",
        }),
      )
    })
  })
})
