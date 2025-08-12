Cypress.Commands.add("loginAndVisit", (email, password, url = "/") => {
  cy.request("POST", "https://akil-backend.onrender.com/login", {
    email,
    password
  }).then((resp) => {
    expect(resp.status).to.eq(200);
    expect(resp.body).to.have.property("token");

    const token = resp.body.token;

    cy.visit(url, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", token);
      }
    });
  });
});
