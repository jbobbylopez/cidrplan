# CidrPlan Testing Guide

This document describes how to run the Cypress UI tests for CidrPlan.

## Setup

Install dependencies:
```bash
npm install
```

## Running Tests

### Interactive Mode (Recommended for Development)
```bash
npm run test:open
```
This opens the Cypress Test Runner where you can see tests run in real-time and debug interactively.

### Headless Mode (For CI/CD)
```bash
npm test
```
Runs all tests in headless mode without opening a browser window.

### Chrome-Specific Testing
```bash
npm run test:chrome
```
Runs tests specifically in Chrome/Brave browser.

## Test Suites

### 1. **subnet-operations.cy.js**
Tests core subnet division and joining logic:
- Initialize with default CIDR
- Apply custom CIDR blocks
- Divide subnets into children
- Join subnets back together
- Button state validation (/32 divide, root join)
- Multi-level hierarchy operations

### 2. **hierarchy-visualization.cy.js**
Tests the visual hierarchy column display:
- Hierarchy column rendering
- Cell alignment across rows
- Parent-child relationship display
- Hover highlighting (ancestors/descendants)
- Colspan calculation for headers

### 3. **naming-and-formatting.cy.js**
Tests naming conventions and number formatting:
- Custom subnet naming
- Name prefix/suffix application
- Number formatting (K/M notation)
- Small number comma formatting
- Names persisting through operations

### 4. **output-formats.cy.js**
Tests all export output formats:
- JSON output validity
- YAML format generation
- HTML code export
- Rendered HTML preview
- Output updates on changes
- Field presence validation

## Before Running Tests

Make sure your dev server is running. You can serve the app with:
```bash
# Using Python
python3 -m http.server 8000

# Or any other static server pointing to the project root
```

The tests expect the app to be at `http://localhost:8000` (configurable in `cypress.config.js`).

## Debugging Tests

1. **Use `.only()` to run single tests:**
   ```javascript
   it.only('should divide a subnet into two children', () => {
     // only this test will run
   });
   ```

2. **Use `.skip()` to skip tests:**
   ```javascript
   it.skip('should join adjacent subnets', () => {
     // this test will be skipped
   });
   ```

3. **Add debug statements:**
   ```javascript
   cy.get('[data-divide]').first().then(($el) => {
     console.log('Divide button found:', $el);
     cy.wrap($el).click();
   });
   ```

4. **Use Cypress Time-Travel:** In interactive mode, hover over commands in the test log to see app state at that point.

## Continuous Integration

To integrate with GitHub Actions or similar CI systems:

```yaml
- name: Run Cypress tests
  run: npm test
```

## Adding New Tests

When adding new features, write tests following this pattern:

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should do something specific', () => {
    // Arrange
    cy.get('#selector').type('value');
    
    // Act
    cy.get('#button').click();
    
    // Assert
    cy.get('#result').should('contain', 'expected text');
  });
});
```

## Common Selectors

- `#baseCidr` - Base CIDR input
- `#applyBase` - Apply button
- `#reset` - Reset button
- `#namePrefix` - Name prefix input
- `#nameSuffix` - Name suffix input
- `#showDetails` - Show details checkbox
- `#outputFormat` - Output format dropdown
- `#copyOutput` - Copy output button
- `.nameInput` - Subnet name input (multiple)
- `[data-divide]` - Divide button
- `[data-join]` - Join button
- `[data-cidr="..."]` - Subnet row by CIDR
- `.hierarchy-cell` - Hierarchy visualization cell
- `#outputCode` - Output code block
- `#outputRendered` - Rendered output

## Troubleshooting

### Tests timeout
- Make sure dev server is running on port 8000
- Check browser console for JavaScript errors

### Selectors not found
- Use `cy.get('.nameInput')` with Cypress DevTools to inspect elements
- Verify selectors match current app structure

### Flaky tests
- Add explicit waits: `cy.get('tbody tr').should('have.length', 2)`
- Use `cy.wait(100)` for timing issues (sparingly)

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Common Cypress Errors](https://docs.cypress.io/guides/references/error-messages)
