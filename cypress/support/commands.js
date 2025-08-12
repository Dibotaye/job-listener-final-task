Cypress.Commands.add("visitWithToken", (url, token) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", token);
    }
  });
});
