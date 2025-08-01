import { describe, beforeEach, it } from "cypress"

describe("Bookmark Functionality", () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem("accessToken", "mock-token")
      win.localStorage.setItem(
        "userData",
        JSON.stringify({
          name: "Test User",
          email: "test@example.com",
        }),
      )
    })

    // Intercept API calls
    cy.intercept("GET", "**/opportunities/search", { fixture: "jobs.json" }).as("getJobs")
    cy.intercept("GET", "**/bookmarks", { fixture: "bookmarks.json" }).as("getBookmarks")
    cy.intercept("POST", "**/bookmarks/*", { success: true }).as("addBookmark")
    cy.intercept("DELETE", "**/bookmarks/*", { success: true }).as("removeBookmark")
  })

  it("should display bookmark button on job cards", () => {
    cy.visit("/")
    cy.wait("@getJobs")

    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').should("be.visible")
        cy.get('[data-testid="bookmark-icon"]').should("be.visible")
      })
  })

  it("should toggle bookmark status when clicked", () => {
    cy.visit("/")
    cy.wait("@getJobs")

    // Click bookmark button
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').click()
      })

    // Verify API call was made
    cy.wait("@addBookmark")

    // Verify button state changed
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').should("have.class", "bg-blue-100")
      })
  })

  it("should show bookmarked jobs in bookmarked tab", () => {
    cy.visit("/")
    cy.wait("@getJobs")

    // Click bookmarked tab
    cy.get('[data-testid="bookmarked-jobs-tab"]').click()
    cy.wait("@getBookmarks")

    // Verify bookmarked jobs are displayed
    cy.get('[data-testid="bookmarked-jobs-list"]').should("be.visible")
    cy.get('[data-testid="job-card"]').should("have.length.at.least", 1)
  })

  it("should remove job from bookmarked list when unbookmarked", () => {
    cy.visit("/")
    cy.wait("@getJobs")

    // Go to bookmarked tab
    cy.get('[data-testid="bookmarked-jobs-tab"]').click()
    cy.wait("@getBookmarks")

    // Count initial bookmarked jobs
    cy.get('[data-testid="job-card"]').then(($jobs) => {
      const initialCount = $jobs.length

      // Unbookmark first job
      cy.get('[data-testid="job-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="bookmark-button"]').click()
        })

      cy.wait("@removeBookmark")

      // Verify job was removed from list
      cy.get('[data-testid="job-card"]').should("have.length", initialCount - 1)
    })
  })

  it("should show error message when not authenticated", () => {
    // Clear authentication
    cy.window().then((win) => {
      win.localStorage.removeItem("accessToken")
      win.localStorage.removeItem("userData")
    })

    cy.visit("/")
    cy.wait("@getJobs")

    // Try to bookmark a job
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').click()
      })

    // Verify error message is shown
    cy.contains("Please login to bookmark jobs").should("be.visible")
  })

  it("should maintain bookmark state when navigating between pages", () => {
    cy.visit("/")
    cy.wait("@getJobs")

    // Bookmark a job
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').click()
      })
    cy.wait("@addBookmark")

    // Click on job to view details
    cy.get('[data-testid="job-card"]').first().click()

    // Verify bookmark button is active in detail view
    cy.get('[data-testid="detail-bookmark-button"]').should("have.class", "bg-blue-100")

    // Go back to job list
    cy.get('[data-testid="back-button"]').click()

    // Verify bookmark state is maintained
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').should("have.class", "bg-blue-100")
      })
  })

  it("should handle bookmark API errors gracefully", () => {
    // Mock API error
    cy.intercept("POST", "**/bookmarks/*", { statusCode: 500, body: { success: false, message: "Server error" } }).as(
      "bookmarkError",
    )

    cy.visit("/")
    cy.wait("@getJobs")

    // Try to bookmark a job
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').click()
      })

    cy.wait("@bookmarkError")

    // Verify error message is shown
    cy.contains("Failed to update bookmark").should("be.visible")
  })

  it("should search jobs and maintain bookmark functionality", () => {
    cy.visit("/")
    cy.wait("@getJobs")

    // Search for jobs
    cy.get('[data-testid="search-input"]').type("Software Engineer")
    cy.get('[data-testid="search-button"]').click()

    // Verify search results are displayed
    cy.get('[data-testid="job-card"]').should("be.visible")

    // Bookmark a job from search results
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').click()
      })

    cy.wait("@addBookmark")

    // Verify bookmark state
    cy.get('[data-testid="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="bookmark-button"]').should("have.class", "bg-blue-100")
      })
  })

  it("should show empty state when no bookmarks exist", () => {
    // Mock empty bookmarks response
    cy.intercept("GET", "**/bookmarks", { success: true, data: [] }).as("getEmptyBookmarks")

    cy.visit("/")
    cy.wait("@getJobs")

    // Go to bookmarked tab
    cy.get('[data-testid="bookmarked-jobs-tab"]').click()
    cy.wait("@getEmptyBookmarks")

    // Verify empty state is shown
    cy.get('[data-testid="no-bookmarks"]').should("be.visible")
    cy.contains("No bookmarked jobs").should("be.visible")
    cy.contains("Start bookmarking jobs to see them here").should("be.visible")
  })
})
