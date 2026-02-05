# Changelog - Dynamic Product Instructions Implementation

## [Unreleased] - 2026-02-05

### Added
- **Fully customizable per-product instruction steps** system
  - Each product can now define its own complete step-by-step instructions in `products.json`
  - Steps are automatically numbered by the browser
  - Special step types support:
    - `type: "connect_button"` - Auto-injects Connect button
    - `type: "flash_button"` - Auto-injects Flash Update button with version info
    - `image` property - Displays images inline with step text
  - Optional `footer_note` field for product-specific additional instructions

- **Optional info/warning section** per product
  - `info_section` object with customizable `title` and `items` array
  - Products can omit this section entirely if not needed
  - Supports HTML content in items for rich formatting

### Changed
- **products.json schema extended** with new `instructions` object:
  ```json
  "instructions": {
    "info_section": {          // Optional
      "title": "⚠️ Important Warnings",
      "items": ["Warning 1", "Warning 2"]
    },
    "steps": [                 // Required
      { "text": "Step text" },
      { "type": "connect_button", "text": "..." },
      { "text": "...", "image": { "url": "...", "width": "...", "height": "..." } }
    ],
    "footer_note": "..."       // Optional
  }
  ```

- **JOTS product configuration**:
  - 6 simple steps (no disassembly required)
  - No warning/info section
  - No internal photo
  - Direct access to USB port

- **LAPS product configuration**:
  - 9 detailed steps (includes disassembly)
  - Warning section with 3 items
  - Internal photo showing micro USB port location
  - Static discharge and enclosure opening instructions

- **app.js template refactored** (lines 208-239):
  - Removed all hardcoded instruction steps
  - Dynamic rendering using `v-for` loop over `selectedProduct.instructions.steps`
  - Conditional rendering for special step types
  - Dynamic warning/info section with customizable title
  - Dynamic footer note rendering

### Removed
- Hardcoded instruction steps from app.js template
- Hardcoded warning messages in template
- `disassembly` object structure (replaced by `steps` array)
- Redundant `installation_notes` usage in template (now part of steps)

### Technical Details

#### Files Modified
1. **builds/products.json**
   - Added `instructions.steps[]` array to JOTS and LAPS
   - Added `instructions.info_section` to LAPS
   - Added `instructions.footer_note` to both products
   - Removed legacy `disassembly` object structure

2. **app/app.js** (lines 208-239)
   - Replaced hardcoded `<li>` elements with dynamic `v-for` loop
   - Added conditional rendering for `info_section`
   - Added support for special step types (`connect_button`, `flash_button`)
   - Added dynamic image rendering within steps
   - Added dynamic footer note rendering

#### Product Comparison

| Feature | JOTS | LAPS |
|---------|------|------|
| Steps | 6 | 9 |
| Info/Warning Section | ❌ None | ✅ "⚠️ Important Warnings" |
| Disassembly Required | ❌ No | ✅ Yes (4 screws) |
| Internal Photo | ❌ No | ✅ Yes (micro USB location) |
| Static Discharge Warning | ❌ No | ✅ Yes (in steps) |
| Footer Note | ✅ Yes (Windows driver) | ✅ Yes (Windows driver) |

#### Benefits
- ✅ **Zero hardcoded product-specific content** in templates
- ✅ **Easy to add new products** - just edit JSON
- ✅ **Maximum flexibility** - each product fully customizable
- ✅ **Auto-numbered steps** - browser handles numbering
- ✅ **Maintainable** - all product data in one place
- ✅ **Future-proof** - supports any number of steps, warnings, images

### Migration Notes
- Legacy `installation_notes` field is still present but no longer used in template
- Can be removed from products.json in future cleanup
- Old `disassembly` structure has been replaced with `steps` array

---

## Previous Changes (from earlier sessions)

### Product Card System Implementation
- Dynamic product selection with card-based UI
- Product metadata loading from `builds/products.json`
- Firmware loading per product selection
- Version display and product-specific branding

### Repository Structure
- Created `builds/` directory structure
- Added `products.json` as single source of truth
- Added per-product firmware directories (jots, laps)
- Added CHANGELOG.md files per product
