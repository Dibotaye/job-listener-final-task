"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail } from "../../../services/auth"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", ""])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("verificationEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Redirect to signup if no email found
      router.push("/auth/signup")
    }
  }, [router])

  useEffect(() => {
    // Countdown timer for resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpString = otp.join("")
    if (otpString.length !== 4) {
      setError("Please enter the complete verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await verifyEmail({ email, OTP: otpString })

      if (response.success) {
        // Clear stored email
        sessionStorage.removeItem("verificationEmail")
        // Redirect to signin page
        router.push("/auth/signin?verified=true")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    setCanResend(false)
    setCountdown(30)
    setError("")

    try {
      // Here you would call a resend OTP API endpoint
      // For now, we'll just reset the countdown
      console.log("Resending OTP to:", email)
    } catch (error) {
      setError("Failed to resend code. Please try again.")
      setCanResend(true)
      setCountdown(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Verify Email</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm leading-relaxed">
              We've sent a verification code to the email address you provided. To complete the verification process,
              please enter the code here.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              ))}
            </div>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                You can request to{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={!canResend}
                  className={`font-medium ${
                    canResend ? "text-blue-600 hover:text-blue-500 cursor-pointer" : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Resend code
                </button>{" "}
                {!canResend && <span className="text-blue-600 font-medium">in {formatTime(countdown)}</span>}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 4}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
