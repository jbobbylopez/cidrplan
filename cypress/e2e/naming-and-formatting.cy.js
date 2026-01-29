describe('CidrPlan Naming and Formatting', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for the HTML structure to load
    cy.get('.app', { timeout: 20000 }).should('be.visible');
    // Wait for table to be rendered
    cy.get('#subnetTable', { timeout: 20000 }).should('exist');
  });

  it('should allow naming a subnet', () => {
    // Find the name input and type in it
    cy.get('.nameInput').first().type('Production');
    
    // Value should be set
    cy.get('.nameInput').first().should('have.value', 'Production');
  });

  it('should apply name prefix', () => {
    // Set prefix
    cy.get('#namePrefix').type('PROD-');
    
    // Change output format to see name
    cy.get('#outputFormat').select('json');
    
    // Name a subnet
    cy.get('.nameInput').first().type('Network');
    
    // Check JSON output contains prefixed name
    cy.get('#outputCode').should('contain', 'PROD-Network');
  });

  it('should apply name suffix', () => {
    // Set suffix
    cy.get('#nameSuffix').type('-VLAN');
    
    // Change output format
    cy.get('#outputFormat').select('json');
    
    // Name a subnet
    cy.get('.nameInput').first().type('Engineering');
    
    // Check output contains suffixed name
    cy.get('#outputCode').should('contain', 'Engineering-VLAN');
  });

  it('should apply both prefix and suffix', () => {
    cy.get('#namePrefix').type('NET-');
    cy.get('#nameSuffix').type('-001');
    cy.get('#outputFormat').select('json');
    
    cy.get('.nameInput').first().type('Core');
    
    cy.get('#outputCode').should('contain', 'NET-Core-001');
  });

  it('should format large numbers with K notation', () => {
    // /8 has 16M hosts, should display as 16M
    cy.get('td:nth-child(3)').first().should('contain', 'M');
  });

  it('should format medium numbers with K notation', () => {
    // Divide to get /9 (8M)
    cy.get('[data-divide]').first().click();
    
    // /9 should show as 8M
    cy.get('td:nth-child(3)').first().should('contain', 'M');
  });

  it('should format small numbers with commas', () => {
    // Create a small subnet
    cy.get('#baseCidr').clear().type('192.168.1.0/29');
    cy.get('#applyBase').click();
    
    // /29 has 8 total, 6 usable - should not have K
    cy.get('td:nth-child(3)').first().should('not.contain', 'K');
    cy.get('td:nth-child(3)').first().should('not.contain', 'M');
  });

  it('should show both total and usable hosts', () => {
    // Format should be "total (usable)" with optional K/M notation and decimals
    cy.get('td:nth-child(3)').first().then(($td) => {
      const text = $td.text();
      // Should have parentheses with two numbers, allowing for K/M notation with decimals
      expect(text).to.match(/\d+\.?\d*[KM]?\s*\(\d+\.?\d*[KM]?\)/);
    });
  });

  it('should clear input on reset', () => {
    cy.get('.nameInput').first().type('TestName');
    cy.get('#reset').click();
    
    // After reset, input should be empty
    cy.get('.nameInput').first().should('have.value', '');
  });

  it('should persist names through divide/join cycles', () => {
    // Name the root
    cy.get('.nameInput').first().type('MainNet');
    
    // Divide
    cy.get('[data-divide]').first().click();
    
    // Rejoin
    cy.get('[data-join]').first().click();
    
    // Name should still be there
    cy.get('.nameInput').first().should('have.value', 'MainNet');
  });
});
