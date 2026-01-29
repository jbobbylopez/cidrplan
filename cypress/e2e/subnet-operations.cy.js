describe('CidrPlan Subnet Operations', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should initialize with default CIDR', () => {
    cy.get('#baseCidr').should('have.value', '10.0.0.0/8');
    cy.get('tbody tr').should('have.length', 1);
  });

  it('should apply a new base CIDR', () => {
    cy.get('#baseCidr').clear().type('192.168.0.0/16');
    cy.get('#applyBase').click();
    
    cy.get('tbody tr').should('have.length', 1);
    cy.get('[data-cidr="192.168.0.0/16"]').should('exist');
  });

  it('should divide a subnet into two children', () => {
    // Start with default 10.0.0.0/8
    cy.get('tbody tr').should('have.length', 1);
    
    // Click divide button
    cy.get('[data-divide]').first().click();
    
    // Should now have 2 rows
    cy.get('tbody tr').should('have.length', 2);
    
    // Check for expected /9 subnets
    cy.get('[data-cidr="10.0.0.0/9"]').should('exist');
    cy.get('[data-cidr="10.128.0.0/9"]').should('exist');
  });

  it('should divide multiple levels deep', () => {
    // Divide once: /8 -> 2x /9
    cy.get('[data-divide]').first().click();
    cy.get('tbody tr').should('have.length', 2);
    
    // Divide first /9: /9 -> 2x /10
    cy.get('[data-divide]').first().click();
    cy.get('tbody tr').should('have.length', 3);
    
    // Check hierarchy
    cy.get('[data-cidr="10.0.0.0/10"]').should('exist');
    cy.get('[data-cidr="10.64.0.0/10"]').should('exist');
    cy.get('[data-cidr="10.128.0.0/9"]').should('exist');
  });

  it('should join adjacent subnets', () => {
    // Divide: /8 -> 2x /9
    cy.get('[data-divide]').first().click();
    cy.get('tbody tr').should('have.length', 2);
    
    // Join first /9 subnet
    cy.get('[data-join]').first().click();
    
    // Should be back to 1 row
    cy.get('tbody tr').should('have.length', 1);
    cy.get('[data-cidr="10.0.0.0/8"]').should('exist');
  });

  it('should disable divide button at /32', () => {
    // Set base to /32
    cy.get('#baseCidr').clear().type('10.0.0.1/32');
    cy.get('#applyBase').click();
    
    // Divide button should be disabled
    cy.get('[data-divide]').should('be.disabled');
  });

  it('should disable join button for root subnet', () => {
    // Default /8 root should have disabled join
    cy.get('[data-join]').should('be.disabled');
  });

  it('should allow join only on child subnets', () => {
    // Divide: /8 -> 2x /9
    cy.get('[data-divide]').first().click();
    
    // Both /9 subnets should have enabled join buttons
    cy.get('[data-join]').each(($btn) => {
      cy.wrap($btn).should('not.be.disabled');
    });
  });
});
