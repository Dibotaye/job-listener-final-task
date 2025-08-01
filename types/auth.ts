// Form data types
export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

export interface SigninFormData {
  email: string
  password: string
}

export interface VerifyEmailData {
  email: string
  OTP: string
}

// Validation error types
export interface ValidationErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

// API response types
export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    accessToken: string
    refreshToken: string
    user?: {
      id: string
      name: string
      email: string
      role: string
    }
  }
  errors?: any
}

// User data type
export interface User {
  id: string
  name: string
  email: string
  role: string
  isVerified?: boolean
}
