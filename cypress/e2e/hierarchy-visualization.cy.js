describe('CidrPlan Hierarchy Visualization', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for app to initialize and render the table
    cy.get('table#subnetTable', { timeout: 10000 }).should('exist');
  });

  it('should display hierarchy column', () => {
    cy.get('th.hierarchy-header').should('exist').and('be.visible');
  });

  it('should have one hierarchy cell for root subnet', () => {
    cy.get('.hierarchy-cell').should('have.length', 1);
  });

  it('should add hierarchy cells when dividing', () => {
    // Divide /8 -> 2x /9
    cy.get('[data-divide]').first().click();
    
    // Should have 2x /9 cells + 2x /8 cells (spanning)
    cy.get('.hierarchy-cell').should('have.length.greaterThan', 2);
  });

  it('should properly align hierarchy cells across rows', () => {
    // Divide /8 -> 2x /9
    cy.get('[data-divide]').first().click();
    
    // Get hierarchy cells
    const cells = cy.get('.hierarchy-cell');
    
    // Each row should have cells in same columns
    cy.get('tbody tr').each(($row, index) => {
      cy.wrap($row).find('.hierarchy-cell').should('have.length.greaterThan', 0);
    });
  });

  it('should show parent-child relationships in hierarchy', () => {
    // Divide /8 -> 2x /9
    cy.get('[data-divide]').first().click();
    
    // Divide first /9 -> 2x /10
    cy.get('[data-divide]').first().click();
    
    // Should have 3 rows total
    cy.get('tbody tr').should('have.length', 3);
    
    // All rows should have hierarchy cells
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('.hierarchy-cell').should('have.length.greaterThan', 0);
    });
  });

  it('should highlight ancestors on cell hover', () => {
    // Divide twice to create hierarchy
    cy.get('[data-divide]').first().click();
    cy.get('[data-divide]').first().click();
    
    // Hover over a cell
    cy.get('.hierarchy-cell').first().trigger('mouseenter');
    
    // Should have highlighted cells
    cy.get('.hierarchy-cell.highlighted').should('have.length.greaterThan', 0);
  });

  it('should clear highlights on mouse leave', () => {
    // Divide to create hierarchy
    cy.get('[data-divide]').first().click();
    
    // Hover and unhover
    cy.get('.hierarchy-cell').first().trigger('mouseenter');
    cy.get('.hierarchy-cell').first().trigger('mouseleave');
    
    // No cells should be highlighted
    cy.get('.hierarchy-cell.highlighted').should('have.length', 0);
  });

  it('should support colspan for hierarchy header', () => {
    // Divide twice
    cy.get('[data-divide]').first().click();
    cy.get('[data-divide]').first().click();
    
    // Header should have colspan > 1
    cy.get('th.hierarchy-header').should(($th) => {
      const colspan = $th.attr('colspan');
      expect(parseInt(colspan) || 1).to.be.greaterThan(1);
    });
  });
});
