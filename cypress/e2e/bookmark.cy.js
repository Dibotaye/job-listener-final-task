beforeEach(() => {
  cy.loginAndVisit(
    Cypress.env("TEST_EMAIL"),
    Cypress.env("TEST_PASSWORD"),
    "/" 
  );
});
