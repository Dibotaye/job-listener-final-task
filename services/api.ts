import type { Job, ApiResponse } from "../types/job"
import { getAccessToken } from "./auth"

const BASE_URL = "https://akil-backend.onrender.com"

/**
 * Fetches all opportunities from the API
 * @returns Promise<Job[]> Array of job opportunities
 */
export async function fetchOpportunities(): Promise<Job[]> {
  try {
    const token = getAccessToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}/opportunities/search`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch opportunities")
    }

    return data.data || []
  } catch (error) {
    console.error("Error fetching opportunities:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Unknown error occurred")
  }
}

/**
 * Search opportunities by title
 * @param query - Search query
 * @returns Promise<Job[]> Array of matching job opportunities
 */
export async function searchOpportunities(query: string): Promise<Job[]> {
  try {
    const token = getAccessToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}/opportunities/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to search opportunities")
    }

    // Filter results by title if API doesn't support title search
    const jobs = data.data || []
    return jobs.filter((job) => job.title.toLowerCase().includes(query.toLowerCase()))
  } catch (error) {
    console.error("Error searching opportunities:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Search failed")
  }
}

/**
 * Fetches a specific opportunity by ID
 * @param id - The opportunity ID
 * @returns Promise<Job> The job opportunity details
 */
export async function fetchOpportunityById(id: string): Promise<Job> {
  try {
    if (!id) {
      throw new Error("Job ID is required")
    }

    const token = getAccessToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}/opportunities/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Job opportunity not found")
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch job details")
    }

    if (!data.data) {
      throw new Error("No job data received")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching opportunity by ID:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Unknown error occurred")
  }
}
