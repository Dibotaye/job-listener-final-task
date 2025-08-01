// API Response structure
export interface ApiResponse {
  success: boolean
  message: string
  data: Job[] | Job
  errors?: any
  count?: number
}

// Main Job interface based on the API structure
export interface Job {
  id: string
  title: string
  description: string
  responsibilities?: string
  requirements?: string
  idealCandidate?: string
  categories?: string[]
  opType: string
  startDate?: string
  endDate?: string
  deadline?: string
  location?: string[]
  requiredSkills?: string[]
  whenAndWhere?: string
  orgName: string
  logoUrl?: string
  isBookmarked?: boolean
  isRolling?: boolean
  questions?: string
  perksAndBenefits?: string
  createdAt?: string
  updatedAt?: string
  orgPrimaryPhone?: string
  orgEmail?: string
  orgID?: string
  datePosted?: string
  status?: string
  applicantsCount?: number
  viewsCount?: number
  orgProfile?: {
    id: string
    name: string
    description?: string
    website?: string
    location?: string[]
    logo?: string
  }
}
