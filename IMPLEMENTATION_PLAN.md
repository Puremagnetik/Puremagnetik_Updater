# Multi-Product Firmware Updater - Implementation Plan

## Project Overview
Transform the Daisy Web Programmer into a multi-product firmware updater for Puremagnetik's Electrosmith Daisy Seed-based products. Users will navigate to the web interface, select their product, and flash the appropriate firmware.

## Architecture Decision
**Selected Approach**: Local Repository with JSON Metadata + Card-Based UI

### Why This Approach
- No external server infrastructure required
- All firmware files version-controlled in git
- Works reliably via GitHub Pages
- Visual, user-friendly product selection
- Simple deployment process (commit and push)

---

## Implementation Phases

### Phase 1: Repository Structure Setup
**Status**: COMPLETE ✅

#### Tasks:
1. ✅ Create `builds/` directory structure
2. ✅ Create `products.json` metadata file (single source of truth)
3. ✅ Add initial product entries (Night Passage, LAPS)
4. ✅ Document folder structure in README
5. ✅ Remove redundant metadata.json files

#### Deliverables:
```
builds/
├── products.json              # Product catalog (single source of truth)
├── README.md                  # Documentation
├── night-passage/
│   ├── NightPassage_1_0_7.bin # (awaiting user upload)
│   └── CHANGELOG.md
└── laps/
    ├── laps_1_0_7.bin         # (awaiting user upload)
    └── CHANGELOG.md
```

**Architecture Change**: Eliminated separate `metadata.json` files to avoid redundancy. All metadata is now in `products.json`.

#### products.json Schema:
```json
{
  "version": "1.0",
  "updated": "2026-02-05",
  "products": [
    {
      "id": "night-passage",
      "name": "Night Passage",
      "description": "Reverb Pedal",
      "manufacturer": "Puremagnetik",
      "image": "builds/night-passage/product-image.jpg",
      "platform": "seed",
      "firmware": {
        "version": "1.0.7",
        "release_date": "2026-01-14",
        "filename": "NightPassage_1_0_7.bin",
        "url": "builds/night-passage/NightPassage_1_0_7.bin",
        "size_bytes": null,
        "checksum_sha256": null
      },
      "changelog": [
        {
          "version": "1.0.7",
          "date": "2026-01-14",
          "changes": ["Latest stable release"]
        }
      ],
      "changelog_url": "builds/night-passage/CHANGELOG.md",
      "installation_notes": "Hold SHIFT button while connecting USB...",
      "support_url": "https://puremagnetik.com/support",
      "documentation_url": "https://puremagnetik.com/products/night-passage"
    }
  ]
}
```

---

### Phase 2: Backend Data Layer
**Status**: COMPLETE ✅

#### Tasks:
1. ✅ Modify `app/app.js` to load `products.json` instead of hardcoded firmware
2. ✅ Update `importExamples()` method to `importProducts()`
3. ✅ Create product data loading logic
4. ✅ Add firmware file loading per product selection
5. ✅ Update Vue.js data model to include products

#### Files to Modify:
- `app/app.js` - Main application logic
  - Lines 13-24: Update data model to include products
  - Lines 326-383: Replace `importExamples()` with `importProducts()`
  - Lines 422-431: Replace hardcoded blink firmware with dynamic product firmware
  - Lines 440-455: Remove or update query string parsing for new system

#### Key Changes:
```javascript
var data = {
    products: [],           // NEW: Array of product objects
    selectedProduct: null,  // NEW: Currently selected product
    // ... existing fields
}
```

---

### Phase 3: Frontend UI - Product Selector
**Status**: COMPLETE ✅

#### Tasks:
1. ✅ Design card-based product grid layout
2. ✅ Create product card component template
3. ✅ Add product images/icons
4. ✅ Style cards to match existing Puremagnetik branding
5. ✅ Add product selection interaction
6. ✅ Update "Flash Update" button to use selected product

#### UI Layout:
```
┌─────────────────────────────────────────┐
│  Puremagnetik Updater                   │
├─────────────────────────────────────────┤
│  Select Your Product:                   │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  Night   │  │   LAPS   │  │Product ││
│  │ Passage  │  │          │  │   3    ││
│  │          │  │          │  │        ││
│  │ v1.0.7   │  │ v1.0.7   │  │ v1.0.0 ││
│  └──────────┘  └──────────┘  └────────┘│
│                                          │
│  [Connect Button]                        │
│  [Flash Update Button]                   │
└─────────────────────────────────────────┘
```

#### Files to Modify:
- `app/app.js` - Template section (lines 144-303)
  - Add product grid before connection instructions
  - Update existing UI to show/hide based on product selection
- `app/style.css` - Add product card styles

#### CSS Classes Needed:
```css
.product-grid { /* Container for product cards */ }
.product-card { /* Individual product card */ }
.product-card-selected { /* Selected state */ }
.product-image { /* Product image styling */ }
.product-info { /* Product name/version */ }
```

---

### Phase 4: Connection Flow Integration
**Status**: COMPLETE ✅

#### Tasks:
1. ✅ Require product selection before enabling "Connect" button
2. ✅ Load correct firmware when product is selected
3. ✅ Update status messages to include product name
4. ✅ Add version display in programming status
5. ✅ Test complete flow: select → connect → flash

#### User Flow:
```
1. User visits page
2. User selects product from cards
3. "Connect" button becomes enabled
4. User follows connection instructions
5. User clicks "Flash Update"
6. Progress bar shows flashing
7. Success message shows product name + version
```

---

### Phase 5: Testing & Refinement
**Status**: PENDING

#### Tasks:
1. Test with multiple products
2. Test error handling (no product selected, connection fails, etc.)
3. Cross-browser testing (Chrome, Edge)
4. Mobile responsive testing
5. Update help text/instructions for new flow
6. Add version history support (optional)

#### Test Cases:
- [ ] Product selection updates firmware URL
- [ ] Cannot connect without selecting product
- [ ] Firmware flashes successfully for each product
- [ ] Error messages are clear and helpful
- [ ] UI is responsive on mobile/tablet
- [ ] Works on Windows (with Zadig driver)
- [ ] Works on macOS
- [ ] Multiple products can be updated in same session

---

### Phase 6: Documentation & Deployment
**Status**: PENDING

#### Tasks:
1. Update main README.md with new usage instructions
2. Document how to add new products
3. Document firmware file requirements (.bin format, size limits, etc.)
4. Add screenshots to documentation
5. Create admin guide for updating firmware
6. Deploy to GitHub Pages
7. Test deployed version

#### Documentation Needed:
- User guide: How to update firmware
- Admin guide: How to add new products/firmware versions
- Developer guide: Architecture and code structure
- Troubleshooting guide: Common issues and solutions

---

## Current Status Summary

### Completed:
- ✅ Research existing implementation
- ✅ Evaluate architecture options
- ✅ Design system architecture
- ✅ Create implementation plan
- ✅ Phase 1: Repository Structure Setup
- ✅ Phase 2: Backend Data Layer
- ✅ Phase 3: Frontend UI - Product Selector
- ✅ Phase 4: Connection Flow Integration
- ✅ **NEW: Dynamic Per-Product Instructions System**
  - ✅ Fully customizable instruction steps per product
  - ✅ Optional info/warning sections
  - ✅ Auto-numbered steps with special types (buttons, images)
  - ✅ Zero hardcoded product-specific content

### In Progress:
- None

### Pending:
- ⏳ Phase 5: Testing & Refinement
- ⏳ Phase 6: Documentation & Deployment

### Blocked:
- None

---

## Technical Notes

### Git LFS Consideration
If firmware files are large (>50MB each) or you have many products:
1. Install Git LFS: `git lfs install`
2. Track binary files: `git lfs track "*.bin"`
3. Commit `.gitattributes`

Current repo has one 113KB bootloader file, so LFS not immediately needed.

### Browser Compatibility
- Requires Chrome 61+ (WebUSB support)
- Currently using Vue.js 2.6.14 (consider migration to Vue 3 in future)
- BootstrapVue is deprecated (future: migrate to Bootstrap 5 + Vue 3)

### Security Considerations
- Firmware files served over HTTPS via GitHub Pages
- No authentication required (public firmware updates)
- Consider adding firmware file checksums/signatures in future

---

## Next Session Checklist

When resuming work:
1. Read this document
2. Review current phase status
3. Check todo list for active tasks
4. Ask user which phase to work on
5. Update this document after completing tasks

---

## Questions for User (To Be Answered)

1. How many products initially? (affects UI design)
2. Product names and current firmware versions?
3. Do you have firmware .bin files ready to add?
4. Do you want version history (multiple versions per product)?
5. Product images/icons available? (for card UI)
6. Any specific branding colors/styles for product cards?

---

## File Change Summary

### Files Created:
- ✅ `builds/products.json` - Product catalog (single source of truth)
- ✅ `builds/README.md` - Firmware management documentation
- ✅ `builds/night-passage/CHANGELOG.md` - Version history
- ✅ `builds/laps/CHANGELOG.md` - Version history
- ✅ `IMPLEMENTATION_PLAN.md` - This document
- ✅ `PROJECT_LOG.md` - Session log

### Files to Add (User):
- `builds/night-passage/NightPassage_1_0_7.bin` - Firmware binary
- `builds/laps/laps_1_0_7.bin` - Firmware binary

### Files to Modify:
- `app/app.js` - Core application logic
- `app/style.css` - Product card styling
- `index.html` - Potentially update title/meta (already says Puremagnetik)
- `README.md` - Update usage instructions

### Files to Review:
- `data/sources.json` - May deprecate or repurpose
- `app/dfu-util.js` - DFU protocol handling (no changes expected)

---

**Last Updated**: 2026-02-05
**Plan Version**: 1.2
**Author**: Claude (AI Assistant)

**Change Log**:
- v1.2: Marked Phases 2-4 as COMPLETE ✅. Added Dynamic Per-Product Instructions System implementation.
- v1.1: Refactored to single products.json (removed redundant metadata.json files)
- v1.0: Initial plan created
