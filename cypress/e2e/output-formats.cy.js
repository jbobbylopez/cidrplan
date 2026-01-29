describe('CidrPlan Output Formats', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display JSON output by default', () => {
    cy.get('#outputFormat').should('have.value', 'json');
    cy.get('#outputCode').should('contain', '{');
    cy.get('#outputCode').should('contain', '"cidr"');
  });

  it('should display valid JSON for default subnet', () => {
    cy.get('#outputCode').then(($code) => {
      const text = $code.text();
      // Should be valid JSON
      expect(() => JSON.parse(text)).not.to.throw();
    });
  });

  it('should switch to YAML format', () => {
    cy.get('#outputFormat').select('yaml');
    cy.get('#outputCode').should('contain', 'cidr:');
    cy.get('#outputCode').should('not.contain', '{');
  });

  it('should switch to HTML Code format', () => {
    cy.get('#outputFormat').select('html');
    cy.get('#outputCode').should('contain', '<table');
    cy.get('#outputCode').should('contain', '</table>');
  });

  it('should switch to Rendered HTML format', () => {
    cy.get('#outputFormat').select('html-rendered');
    cy.get('#outputRendered').should('be.visible');
    cy.get('#outputRendered table').should('exist');
  });

  it('should update output when subnet is named', () => {
    cy.get('#outputFormat').select('json');
    
    // Get initial output
    cy.get('#outputCode').then(($initial) => {
      const initialText = $initial.text();
      expect(initialText).not.to.contain('"name":"TestNetwork"');
    });
    
    // Name the subnet
    cy.get('.nameInput').first().type('TestNetwork');
    
    // Output should update with name
    cy.get('#outputCode').should('contain', 'TestNetwork');
  });

  it('should update output when subnets are divided', () => {
    cy.get('#outputFormat').select('json');
    
    // Initial count
    cy.get('#outputCode').then(($initial) => {
      const initialCount = ($initial.text().match(/"cidr"/g) || []).length;
      
      // Divide
      cy.get('[data-divide]').first().click();
      
      // Should have 2 cidrs now
      cy.get('#outputCode').then(($updated) => {
        const updatedCount = ($updated.text().match(/"cidr"/g) || []).length;
        expect(updatedCount).to.equal(initialCount + 1);
      });
    });
  });

  it('should include cidr, name, and hosts fields in JSON', () => {
    cy.get('#outputFormat').select('json');
    
    cy.get('#outputCode').then(($code) => {
      const json = JSON.parse($code.text());
      
      // Should be array
      expect(Array.isArray(json)).to.be.true;
      
      // First item should have required fields
      expect(json[0]).to.have.property('cidr');
      expect(json[0]).to.have.property('name');
      expect(json[0]).to.have.property('hosts');
    });
  });

  it('should include total and usable in hosts object', () => {
    cy.get('#outputFormat').select('json');
    
    cy.get('#outputCode').then(($code) => {
      const json = JSON.parse($code.text());
      
      expect(json[0].hosts).to.have.property('total');
      expect(json[0].hosts).to.have.property('usable');
      expect(json[0].hosts.total).to.be.a('number');
      expect(json[0].hosts.usable).to.be.a('number');
    });
  });

  it('should have copy button', () => {
    cy.get('#copyOutput').should('exist').and('be.visible');
    cy.get('#copyOutput').should('have.text', 'Copy');
  });

  it('should display output hint for current format', () => {
    cy.get('#outputHint').should('contain', 'JSON');
    
    cy.get('#outputFormat').select('yaml');
    cy.get('#outputHint').should('contain', 'YAML');
  });
});
