import type { SignupFormData, SigninFormData, VerifyEmailData, AuthResponse } from "../types/auth"

const BASE_URL = "https://akil-backend.onrender.com"

/**
 * Sign up a new user
 * @param userData - User signup data
 * @returns Promise<AuthResponse> Response from signup API
 */
export async function signupUser(userData: SignupFormData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data: AuthResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error("Signup error:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Signup failed")
  }
}

/**
 * Sign in an existing user
 * @param credentials - User signin credentials
 * @returns Promise<AuthResponse> Response from signin API with access token
 */
export async function signinUser(credentials: SigninFormData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    const data: AuthResponse = await response.json()

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error("Invalid email or password")
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    if (!data.success) {
      throw new Error(data.message || "Login failed")
    }

    return data
  } catch (error) {
    console.error("Signin error:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Login failed")
  }
}

/**
 * Verify user email with OTP
 * @param verificationData - Email and OTP data
 * @returns Promise<AuthResponse> Response from verification API
 */
export async function verifyEmail(verificationData: VerifyEmailData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationData),
    })

    const data: AuthResponse = await response.json()

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Invalid verification code")
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    if (!data.success) {
      throw new Error(data.message || "Email verification failed")
    }

    return data
  } catch (error) {
    console.error("Email verification error:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Please check your internet connection")
    }

    throw error instanceof Error ? error : new Error("Email verification failed")
  }
}

/**
 * Get stored access token
 * @returns string | null Access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

/**
 * Get stored user data
 * @returns any | null User data from localStorage
 */
export function getUserData(): any | null {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("userData")
    return userData ? JSON.parse(userData) : null
  }
  return null
}

/**
 * Check if user is authenticated
 * @returns boolean Whether user has valid access token
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

/**
 * Logout user by clearing stored data
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userData")
    sessionStorage.removeItem("verificationEmail")
  }
}
