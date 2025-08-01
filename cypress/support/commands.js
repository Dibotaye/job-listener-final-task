// Import Cypress
const Cypress = require("cypress")

// Custom commands for authentication
Cypress.Commands.add("login", (email = "test@example.com", password = "password123") => {
  cy.window().then((win) => {
    win.localStorage.setItem("accessToken", "mock-token")
    win.localStorage.setItem(
      "userData",
      JSON.stringify({
        name: "Test User",
        email: email,
      }),
    )
  })
})

Cypress.Commands.add("logout", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("accessToken")
    win.localStorage.removeItem("refreshToken")
    win.localStorage.removeItem("userData")
    win.sessionStorage.removeItem("verificationEmail")
  })
})
