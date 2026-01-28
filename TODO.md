# CidrPlan - Code Improvement TODOs

## Completed (v0.1.7)

### ✅ Subnet Hierarchy Visualization (v0.1.7)
- **Status**: COMPLETED
- **Change**: Added interactive hierarchy column to subnet table showing parent-child relationships
- **Implementation**:
  - Dynamic colspan calculation based on maximum nesting depth
  - Rowspan calculation for cells at each ancestry level
  - Interactive hover effects highlighting ancestors and descendants
  - Handles both direct hovers and rowspan-covered cells
- **Files modified**: `src/ui/render.js` (added `renderHierarchyVisualization()` function ~200 lines)
- **Impact**: Users can now visualize how subnets are related through the hierarchy tree

### ✅ Event Listener Leaks (v0.1.5)
- **Status**: FIXED
- **Change**: Switched table controls to event delegation in `renderApp()` instead of re-attaching listeners on every render
- **Commit**: Atomic refactor with no regressions

### ✅ Extract Shared Utilities (v0.1.5)
- **Status**: FIXED
- **Change**: Created `src/utils/escape.js` with `escapeHtml()`, `escapeAttr()`, and `escapeYaml()` functions
- **Impact**: Eliminated duplication across output modules (toHtmlTable.js, toYaml.js)

### ✅ Extract Magic Values / Configuration (v0.1.5)
- **Status**: FIXED
- **Change**: Created `src/config.js` with all configurable constants
- **Includes**: `USE_ADSENSE`, `DEFAULT_CIDR`, `OUTPUT_MODES`, `OUTPUT_HINTS`
- **Impact**: Single source of truth for app configuration

### ✅ Add Error Boundaries (v0.1.5)
- **Status**: FIXED
- **Change**: Wrapped formatter calls in try-catch with user-friendly error messages in `main.js`
- **Impact**: App gracefully handles formatter errors instead of crashing

### ✅ Add JSDoc Comments (v0.1.5)
- **Status**: PARTIALLY COMPLETE
- **Files completed**: `src/net/subnet.js` (RFC 3021 behavior documented for /31, /32)
- **Files completed**: `src/utils/escape.js`, `src/utils/naming.js`
- **Still needed**: `src/state/store.js`, `src/output/*` modules
- **Priority**: MEDIUM

### ✅ Update Comments (v0.1.5)
- **Status**: FIXED
- **Change**: Line 12 in store.js now correctly documents output modes: `"json" | "yaml" | "html" | "html-rendered"`

---

## Critical Issues (Still Open)

### Mutable State Exposure (src/state/store.js)
- `state` object is directly exposed in return object (line 111)
- External code can mutate state bypassing setter methods
- **Solution**: Return deepProxy or only expose getters
- **Priority**: HIGH
- **Note**: Users can access `store.state` directly and modify it, bypassing validation

---

## Medium Priority - Code Quality

### Output Formatter Registry Pattern
- **Status**: PARTIALLY COMPLETE
- **Current**: `main.js` directly imports all formatters and uses switch statement for modes
- **Completed**: `OUTPUT_MODES` and `OUTPUT_HINTS` centralized in config.js
- **Remaining**: Extract formatter imports to registry that maps format names to formatter functions
- **Solution**: Create `src/output/registry.js` with pattern like:
  ```javascript
  export const formatters = {
    json: toJson,
    yaml: toYaml,
    html: toHtmlTable,
    "html-rendered": toHtmlTable
  };
  ```
- **Benefits**: Single place to manage output formats, easier to add new ones, reduces main.js coupling
- **Priority**: MEDIUM

### Extract Leaf Node Transformation
- Each output formatter independently calls `describeCidr()` on leaf nodes
- **Solution**: Create shared function in `src/output/formatter.js` for node transformation
- **Benefits**: Single place to modify how nodes are prepared for export
- **Priority**: MEDIUM

### Standardize Code Style
- **Status**: PENDING
- **Issue**: Mixed 2-space and 3-space indentation in some files
- **Solution**: Run through linter or manual cleanup
- **Priority**: LOW

---

## Data Flow & Architecture

### Output Format Validation
- No enforcement that output formatter functions follow consistent signature
- **Solution**: Document formatter interface/contract (not strict typing without TypeScript)
- **Current**: All formatters accept `(leafNodes, options)` with options containing `showDetails`, `namePrefix`, `nameSuffix`
- **Priority**: LOW

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
  - Save state on every state change
  - Restore on app initialization
  - Add "Clear history" button if desired
- **Priority**: MEDIUM

### UID Generation Security
- `uid()` function uses `Math.random()` (not cryptographically secure)
- **Solution**: Use `crypto.randomUUID()` if browser compatibility allows
- **Note**: Document limitation if maintaining Math.random()
- **Current**: Works fine for local app, not exposed to network
- **Priority**: LOW

### Input Validation
- `ipToInt()` validates but `intToIp()` doesn't validate output range
- **Solution**: Add boundary checks for completeness
- **Priority**: LOW

### Internationalization (i18n)
- Hint text and error messages hardcoded throughout codebase
- **Solution**: Extract to localization system if multi-language support planned
- **Priority**: LOW (future feature)

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

## Refactoring Priority Order (Remaining)

1. Fix mutable state exposure (HIGH)
2. Add output formatter registry (MEDIUM)
3. Extract leaf node transformation utility (MEDIUM)
4. Add JSDoc to store.js and output modules (MEDIUM)
5. Add LocalStorage persistence (MEDIUM)
6. Output format validation/documentation (LOW)
7. Extract UI constants (LOW)
8. Standardize indentation (LOW)
9. Add logging/debugging (LOW)
10. Add unit tests (LOW - post-release)
