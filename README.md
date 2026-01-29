# CidrPlan Subnet Planner

Interactive IPv4 subnet planning and visualization

## Overview

**CidrPlan** is a lightweight, browser-based IPv4 subnet planning tool that lets you interactively design and manage network address spaces. Split larger blocks into smaller subnets, merge them back together, name your networks, and export your plans in multiple formats—all without leaving your browser.

## Key Features

- **Interactive Subnet Division & Merging**: Recursively split CIDR blocks or merge adjacent subnets back together
- **Subnet Naming**: Label each subnet with custom names and apply organization-wide prefix/suffix conventions
- **Multiple Output Formats**: Export your plan as JSON, YAML, HTML code, or rendered HTML preview
- **Real-time Updates**: See all outputs update instantly as you modify your plan
- **No Data Collection**: Runs entirely in your browser—your planning stays private
- **RFC 3021 Compliant**: Proper handling of /31 and /32 subnets
- **Clean, Minimal UI**: Focus on planning, not complexity

## Getting Started

1. Open the app in any modern web browser
2. Enter a base CIDR block (e.g., `10.0.0.0/16`)
3. Click **Apply** to initialize your plan
4. Use **Divide** and **Join** buttons to split/merge subnets
5. Name your subnets in the table
6. Optionally add a name prefix/suffix (e.g., `PROD-` and `-VLAN`)
7. Select your desired output format and copy the result

## Usage Examples

### Basic Planning
- Start with `10.0.0.0/8` (your internal network)
- Divide into `/16` blocks for departments
- Further divide `/16` into `/24` blocks for floors/buildings
- Export JSON for documentation

### Consistent Naming
- Set prefix: `CORP-`
- Set suffix: `-NET`
- Name a subnet `Engineering`
- Output shows: `CORP-Engineering-NET`

### Export Formats
- **JSON**: Structured data for scripts/automation
- **YAML**: Human-readable configuration format
- **HTML Code**: Paste into websites/wikis
- **Rendered HTML**: Quick visual preview

## Features

- ✅ Recursive subnet splitting/merging
- ✅ Custom subnet naming
- ✅ JSON, YAML, HTML export formats
- ✅ Rendered HTML preview
- ✅ Name prefix/suffix automation
- ✅ Show/hide detailed subnet information
- ✅ Copy-to-clipboard support
- ✅ Responsive design
- ✅ No external dependencies
- ✅ Privacy-first (local browser only)

## Technical Details

- **Language**: Vanilla JavaScript (ES6 modules)
- **Browser**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **Size**: Minimal, no npm dependencies
- **Architecture**: Modular codebase with separation of concerns

## Author

Created by [J. Bobby Lopez](https://www.jbldata.com/)

## License

MIT License. See [LICENSE](LICENSE) file for details.

---

## Testing

CidrPlan includes a comprehensive Cypress test suite covering all core functionality.

### Running Tests

```bash
# Install dependencies
npm install

# Run tests in headless mode (CI/CD)
npm test

# Run tests interactively (development)
npm run test:open

# Run tests in Chrome
npm run test:chrome
```

Before running tests, start the dev server:
```bash
python3 -m http.server 8000
```

### Test Coverage

- **Subnet Operations** (8 tests): Divide/join logic, button states
- **Hierarchy Visualization** (8 tests): Column rendering, alignment, hover effects
- **Naming & Formatting** (10 tests): Custom names, prefix/suffix, number formatting
- **Output Formats** (11 tests): JSON, YAML, HTML export validation

See [TESTING.md](TESTING.md) for detailed testing documentation.

---

**Version**: v0.1.9

For more information, visit [jbldata.com](https://www.jbldata.com/)
