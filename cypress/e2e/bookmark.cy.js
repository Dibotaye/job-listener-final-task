describe("Bookmark Functionality", () => {

  beforeEach(() => {
    // Visit jobs page with a valid token already in localStorage
    cy.visitWithToken("/opportunities", Cypress.env("TEST_TOKEN"));
  });

  it("should bookmark a job", () => {
    cy.get("[data-testid='bookmark-btn']").first().click();
    cy.get("[data-testid='bookmark-btn']").first()
      .should("have.class", "bookmarked");
  });

  it("should unbookmark a job", () => {
    cy.get("[data-testid='bookmark-btn']").first().click();
    cy.get("[data-testid='bookmark-btn']").first().click();
    cy.get("[data-testid='bookmark-btn']").first()
      .should("not.have.class", "bookmarked");
  });

  it("should display bookmarked jobs in the bookmarked jobs list", () => {
    cy.get("[data-testid='bookmark-btn']").first().click();
    cy.visitWithToken("/bookmarks", Cypress.env("TEST_TOKEN"));
    cy.get("[data-testid='bookmarked-jobs-list']").should("exist");
    cy.get("[data-testid='bookmarked-jobs-list'] .job-card")
      .should("have.length.greaterThan", 0);
  });

  it("should show 'No bookmarked jobs' when none are bookmarked", () => {
    cy.visitWithToken("/bookmarks", Cypress.env("TEST_TOKEN"));
    cy.get("[data-testid='no-bookmarks']").should("exist");
    cy.contains("No bookmarked jobs").should("be.visible");
  });

});
