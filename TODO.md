# CidrPlan - Code Improvement TODOs

## Critical Issues

### Event Listener Leaks (src/ui/render.js)
- Event listeners are re-attached every render cycle in `renderApp()` (lines 14, 20, 26)
- Creates multiple listeners for same element
- **Solution**: Use event delegation OR remove old listeners before attaching new ones
- **Priority**: HIGH

### Mutable State Exposure (src/state/store.js)
- `state` object is directly exposed in return object
- External code can mutate state bypassing setter methods
- **Solution**: Return deepProxy or only expose getters
- **Priority**: HIGH

### Output Formatter Coupling (src/main.js)
- `onNeedOutput` callback contains switch statement for three output formats
- Tightly couples main.js to all output modules
- **Solution**: Extract to `src/output/formatter.js` or create output registry
- **Priority**: MEDIUM

---

## Code Quality & Maintainability

### Extract Shared Utilities
- **Escape functions**: `escapeAttr()` in render.js and `escapeHtml()` in toHtmlTable.js are nearly identical
- **Solution**: Create `src/utils/escape.js` with shared escaping utilities
- **Also applies to**: `escapeYamlString()` in toYaml.js
- **Priority**: MEDIUM

### Output Formatter Registry (src/output/registry.js)
- Currently main.js directly imports all formatters
- New formatters require code changes in main.js
- **Solution**: Create registry pattern that maps format names to formatter functions
- **Benefits**: Single place to manage output formats, easier to add new ones
- **Priority**: MEDIUM

### Standardize Code Style
- **Indentation**: Lines 23-40, 53-57, 69-74, 81-85 in main.js have mixed 2-space and 3-space indentation
- **Solution**: Enforce consistent 2-space indentation throughout
- **Priority**: LOW

---

## Configuration & Constants

### Extract Magic Values (src/config.js)
- Hard-coded default CIDR "10.0.0.0/8" in main.js reset handler
- Ad configuration `USE_ADSENSE` flag should be in config
- Output modes hardcoded in multiple places
- **Solution**: Create `src/config.js` with all configurable constants
- **Priority**: MEDIUM

### Update Comments
- Line 11 in store.js: Comment says `"json" | "html"` but should include `"yaml"`
- **Solution**: Update to reflect current supported modes
- **Priority**: LOW

---

## Documentation

### Add JSDoc Comments
- **Files**: `src/net/subnet.js`, `src/state/store.js`, `src/output/*`
- **Focus**: Especially document RFC 3021 behavior for /31, /32 in subnet.js
- **Benefits**: Improves IDE autocomplete and code discoverability
- **Priority**: MEDIUM

### Escape Function Documentation
- YAML escape logic with regex pattern needs explanation
- HTML escape coverage should be documented
- **Priority**: LOW

---

## Data Flow Improvements

### Extract Leaf Node Transformation
- Each output formatter independently calls `describeCidr()` on leaf nodes
- **Solution**: Create shared function in `src/output/formatter.js` for node transformation
- **Benefits**: Single place to modify how nodes are prepared for export
- **Priority**: MEDIUM

### Output Format Validation
- No enforcement that output formatter functions follow consistent signature
- **Solution**: Create interface/type definition for formatters
- **Priority**: LOW

---

## Error Handling

### Add Error Boundaries
- App crashes if any output formatter throws an error
- **Solution**: Wrap formatter calls in try-catch with user-friendly error messages
- **Priority**: MEDIUM

### Silent Failures in Store
- `divide()`, `join()` methods silently return on precondition failures
- **Solution**: Consider logging warnings or throwing descriptive errors for debugging
- **Priority**: LOW

---

## UI/UX Improvements

### Event Listener Performance
- Attach/detach cycle in render happens on every state change
- **Solution**: Implement proper cleanup or use event delegation
- **Priority**: MEDIUM

### Hardcoded Data Attributes
- HTML uses `data-name`, `data-divide`, `data-join` tied directly to IDs
- **Solution**: Create `src/constants/ui.js` for DOM attribute constants
- **Priority**: LOW

---

## Future Features / Enhancements

### LocalStorage Persistence
- State is lost on page refresh
- **Users expect**: To save their planning sessions
- **Solution**: Add localStorage integration to store
- **Priority**: MEDIUM

### UID Generation Security
- `uid()` function uses `Math.random()` (not cryptographically secure)
- **Solution**: Use `crypto.randomUUID()` if browser compatibility allows
- **Note**: Document limitation if maintaining Math.random()
- **Priority**: LOW

### Internationalization (i18n)
- Hint text and error messages hardcoded throughout codebase
- **Solution**: Extract to localization system if multi-language support planned
- **Priority**: LOW (future feature)

### Input Validation
- `ipToInt()` validates but `intToIp()` doesn't validate output range
- **Solution**: Add boundary checks for completeness
- **Priority**: LOW

---

## Testing & Development

### Add Logging/Debugging
- No way to debug state changes or module interactions
- **Solution**: Add optional debug logging (could use debug library)
- **Priority**: LOW

### Add Unit Tests
- Core modules (subnet.js, store.js) would benefit from unit tests
- **Priority**: LOW (post-release)

---

## Refactoring Priority Order

1. Fix event listener leaks (HIGH)
2. Extract output formatter registry (MEDIUM)
3. Extract escape utilities (MEDIUM)
4. Add error boundaries (MEDIUM)
5. Extract configuration (MEDIUM)
6. Fix mutable state exposure (HIGH)
7. Add JSDoc comments (MEDIUM)
8. Standardize indentation (LOW)
9. Add LocalStorage persistence (MEDIUM)
10. Add logging/debugging (LOW)
