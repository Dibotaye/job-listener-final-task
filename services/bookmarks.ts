import { getAccessToken } from "./auth"

const BASE_URL = "https://akil-backend.onrender.com"

export interface Bookmark {
  eventID: string
  dateBookmarked: string
  datePosted: string
  logoUrl: string
  opType: string
  orgName: string
  title: string
  location: string[]
}

export interface BookmarkResponse {
  success: boolean
  message: string
  data?: Bookmark[]
  errors?: any
}


export async function getBookmarks(): Promise<Bookmark[]> {
  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/bookmarks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.")
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: BookmarkResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch bookmarks")
    }

    return data.data || []
  } catch (error) {
    console.error("Error fetching bookmarks:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Failed to fetch bookmarks")
  }
}


export async function addBookmark(jobId: string): Promise<boolean> {
  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/bookmarks/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}), 
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.")
      }
      if (response.status === 409) {
        throw new Error("Job is already bookmarked")
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: BookmarkResponse = await response.json()
    return data.success
  } catch (error) {
    console.error("Error adding bookmark:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Failed to bookmark job")
  }
}


export async function removeBookmark(jobId: string): Promise<boolean> {
  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${BASE_URL}/bookmarks/${jobId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.")
      }
      if (response.status === 404) {
        throw new Error("Bookmark not found")
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: BookmarkResponse = await response.json()
    return data.success
  } catch (error) {
    console.error("Error removing bookmark:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Failed to remove bookmark")
  }
}


export async function toggleBookmark(jobId: string, currentStatus: boolean): Promise<boolean> {
  try {
    if (currentStatus) {
      await removeBookmark(jobId)
      return false
    } else {
      await addBookmark(jobId)
      return true
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to toggle bookmark")
  }
}
