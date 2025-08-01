import type { SignupFormData, SigninFormData, ValidationErrors } from "../types/auth"

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns boolean - Whether email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param password - Password string to validate
 * @returns string | null - Error message or null if valid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long"
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must contain at least one lowercase letter"
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must contain at least one uppercase letter"
  }

  if (!/(?=.*\d)/.test(password)) {
    return "Password must contain at least one number"
  }

  return null
}

/**
 * Validate signup form data
 * @param formData - Signup form data to validate
 * @returns ValidationErrors - Object containing validation errors
 */
export function validateSignupForm(formData: SignupFormData): ValidationErrors {
  const errors: ValidationErrors = {}

  // Name validation
  if (!formData.name.trim()) {
    errors.name = "Full name is required"
  } else if (formData.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters long"
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = "Email address is required"
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Please enter a valid email address"
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required"
  } else {
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      errors.password = passwordError
    }
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password"
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  return errors
}

/**
 * Validate signin form data
 * @param formData - Signin form data to validate
 * @returns ValidationErrors - Object containing validation errors
 */
export function validateSigninForm(formData: SigninFormData): ValidationErrors {
  const errors: ValidationErrors = {}

  // Email validation
  if (!formData.email.trim()) {
    errors.email = "Email address is required"
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Please enter a valid email address"
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required"
  }

  return errors
}
