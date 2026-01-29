# CidrPlan Testing Guide

Comprehensive testing guide for the CidrPlan Cypress test suite. CidrPlan includes **37 automated tests** across **4 test suites** covering core functionality, UI interactions, and output formats.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server in another terminal
python3 -m http.server 8000

# 3. Run tests
npm test              # Headless mode
npm run test:open     # Interactive mode
npm run test:chrome   # Chrome browser
```

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

## Test Suites (37 tests total)

### 1. **subnet-operations.cy.js** (8 tests)
Tests core subnet division and joining logic:
- ✅ Initialize with default CIDR (10.0.0.0/8)
- ✅ Apply custom CIDR blocks
- ✅ Divide a subnet into two children
- ✅ Divide multiple levels deep
- ✅ Join adjacent subnets back together
- ✅ Disable divide button at /32
- ✅ Disable join button for root subnet
- ✅ Allow join only on child subnets

### 2. **hierarchy-visualization.cy.js** (8 tests)
Tests the visual hierarchy column display and interactions:
- ✅ Display hierarchy column header
- ✅ Single hierarchy cell for root subnet
- ✅ Add hierarchy cells when dividing
- ✅ Properly align hierarchy cells across rows
- ✅ Show parent-child relationships in hierarchy
- ✅ Highlight ancestors on cell hover
- ✅ Clear highlights on mouse leave
- ✅ Support colspan for hierarchy header

### 3. **naming-and-formatting.cy.js** (10 tests)
Tests naming conventions and number formatting:
- ✅ Allow naming a subnet
- ✅ Apply name prefix
- ✅ Apply name suffix
- ✅ Apply both prefix and suffix
- ✅ Format large numbers with K notation
- ✅ Format medium numbers with M notation
- ✅ Format small numbers with commas
- ✅ Show both total and usable hosts
- ✅ Clear input on reset
- ✅ Persist names through divide/join cycles

### 4. **output-formats.cy.js** (11 tests)
Tests all export output formats and data structure:
- ✅ Display JSON output by default
- ✅ Display valid JSON for default subnet
- ✅ Switch to YAML format
- ✅ Switch to HTML Code format
- ✅ Switch to Rendered HTML format
- ✅ Update output when subnet is named
- ✅ Update output when subnets are divided
- ✅ Include cidr, name, and hosts fields in JSON
- ✅ Include total and usable in hosts object
- ✅ Display copy button
- ✅ Display output hint for current format

## Before Running Tests

### Server Setup

Make sure your dev server is running from the **project root directory**:
```bash
# Using Python (recommended)
python3 -m http.server 8000

# Or Node.js
npx http-server -p 8000

# Or any other static server pointing to the project root
```

**Important**: Server must run from `/media/jbl/vdc2022nas/Projects/cidrplan/`, not a subdirectory.

The tests expect the app to be at `http://localhost:8000` (configurable in `cypress.config.js`).

### Application Loading

The application uses ES6 modules which require time to parse and load. Tests include a 20-second timeout for:
- `.app` element to be visible
- `#subnetTable` to exist and load

This ensures the JavaScript module system has time to initialize before tests run.

## Debugging Tests

### Common Debugging Techniques

1. **Use `.only()` to run single test:**
    ```javascript
    it.only('should divide a subnet into two children', () => {
      // only this test will run
    });
    ```

2. **Use `.skip()` to skip a test:**
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

4. **Use Cypress Time-Travel:** In interactive mode (`npm run test:open`), hover over commands in the test log to see app state at that point.

5. **Use DevTools:** In interactive mode, open browser DevTools to inspect elements and check console for errors.

### Troubleshooting Test Failures

**Tests timeout with "element not found":**
- Verify server is running on port 8000
- Check browser console for JavaScript syntax/module loading errors
- Increase timeout in Cypress config if needed for slow machines

**Selectors not matching:**
- Use Cypress DevTools (interactive mode) to inspect element IDs and classes
- Verify selectors in TESTING.md match current HTML structure
- Check for whitespace or attribute mismatches

**Flaky tests (intermittent failures):**
- Add explicit waits: `cy.get('tbody tr').should('have.length', 2)`
- Use `cy.wait(100)` sparingly for timing issues
- Check for race conditions in application code

## Continuous Integration

To integrate with GitHub Actions or similar CI systems:

```yaml
- name: Install dependencies
  run: npm install

- name: Start dev server
  run: python3 -m http.server 8000 &
  
- name: Wait for server
  run: sleep 2

- name: Run Cypress tests
  run: npm test
```

All tests run headless in CI environments and will exit with proper exit codes for pass/fail.

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

## Test Statistics

- **Total Tests**: 37
- **Test Files**: 4 suites
- **Execution Time**: ~19-20 seconds (headless mode)
- **Browser**: Electron (default), Chrome (with `--browser chrome`)
- **Framework Version**: Cypress 13.17.0
- **Status**: All tests passing ✅

## Performance Notes

- Application loads with ES6 modules: ~2-3 seconds
- Test initialization: ~1-2 seconds per suite
- Each test operation (divide/join): ~100-300ms
- Output format switching: ~50-100ms
- Total suite execution is linear (tests run sequentially)

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Common Cypress Errors](https://docs.cypress.io/guides/references/error-messages)
