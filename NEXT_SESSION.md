# Next Session - Phase 2: Backend Data Layer

## Current Status
**Phase 1**: ✅ COMPLETE
**Phase 2**: Ready to begin

## What's Done
- ✅ Repository structure created (`builds/` directory)
- ✅ Single `products.json` with all metadata (no redundant files)
- ✅ 2 products configured: JOTS (v1.0.1) and LAPS (v1.0.7)
- ✅ Firmware binaries added for both products
- ✅ Product images ready (`jots_flat.jpg`, `laps_flat.jpg`)
- ✅ Documentation complete (IMPLEMENTATION_PLAN.md, PROJECT_LOG.md, builds/README.md)

## Files Ready
```
builds/
├── products.json              ✅ 2 products configured
├── README.md                  ✅ Documentation
├── jots/
│   ├── jots_1_0_1.bin        ✅ Firmware ready
│   ├── jots_flat.jpg         ✅ Product image
│   ├── CHANGELOG.md          ✅
│   └── metadata.json         (legacy, can be deleted)
└── laps/
    ├── laps_1_0_7.bin        ✅ Firmware ready
    ├── laps_flat.jpg         ✅ Product image
    └── CHANGELOG.md          ✅
```

---

## Phase 2: Backend Data Layer (Next Steps)

### Goal
Modify `app/app.js` to load products from `builds/products.json` instead of hardcoded firmware URL.

### Tasks for Next Session

#### 1. Update Vue.js Data Model
**File**: `app/app.js` (lines 13-24)

Current:
```javascript
var data = {
    platforms: [],
    examples: [],
    no_device: true,
    sel_platform: null,
    sel_example: null,
    // ...
}
```

Change to:
```javascript
var data = {
    products: [],              // NEW: Product array from products.json
    selectedProduct: null,     // NEW: Currently selected product
    no_device: true,
    // Remove old examples/platforms fields
}
```

#### 2. Replace importExamples() with importProducts()
**File**: `app/app.js` (lines 326-383)

Current behavior:
- Loads from `data/sources.json` → external `examples.json`
- Fetches "blink" example firmware

New behavior:
- Load `builds/products.json` directly
- Parse products array
- Store in `this.products`

**Implementation**:
```javascript
importProducts() {
    var self = this
    var products_url = getRootUrl().split("?")[0].concat("builds/products.json")
    var raw = new XMLHttpRequest();
    raw.open("GET", products_url, true);
    raw.responseType = "text"
    raw.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.response);
            self.products = obj.products;
            // Preload first product's firmware (or wait for user selection)
        }
    }
    raw.send(null)
}
```

#### 3. Remove Hardcoded Firmware URL
**File**: `app/app.js` (line 428)

Current:
```javascript
var expath = "https://ec2.puremagnetik.com/firmware_update/NightPassage_1_0_7.bin"
```

Change to: Load firmware based on selected product

#### 4. Update mounted() Lifecycle Hook
**File**: `app/app.js` (lines 315-324)

Current:
```javascript
mounted() {
    // ...
    this.importExamples()
}
```

Change to:
```javascript
mounted() {
    // ...
    this.importProducts()
}
```

#### 5. Add Product Selection Method
New method to handle product selection:

```javascript
methods: {
    productSelected(product) {
        var self = this
        self.selectedProduct = product
        self.firmwareFileName = product.name + " v" + product.firmware.version

        // Load firmware binary
        readServerFirmwareFile(product.firmware.url, false).then(buffer => {
            blinkFirmwareFile = buffer  // Use existing global variable
        })
    }
}
```

#### 6. Remove/Update Query String Parsing
**File**: `app/app.js` (lines 440-455)

Current system uses `?platform=seed&name=blink` query strings.

Decision needed:
- Keep for backwards compatibility?
- Change to `?product=jots`?
- Remove entirely?

---

## Phase 3: Frontend UI (After Phase 2)

### Goal
Create card-based product selector UI

### Tasks (High Level)
1. Add product grid to Vue template (before connection instructions)
2. Create product card components with:
   - Product image
   - Product name
   - Current version
   - Selected state styling
3. Wire up `@click="productSelected(product)"` events
4. Show/hide sections based on product selection
5. Update "Flash Update" button to use selected product

### UI Reference
```
┌─────────────────────────────────────┐
│  Select Your Product:               │
│                                     │
│  ┌──────────┐    ┌──────────┐     │
│  │  [JOTS]  │    │  [LAPS]  │     │
│  │          │    │          │     │
│  │  v1.0.1  │    │  v1.0.7  │     │
│  └──────────┘    └──────────┘     │
│                                     │
│  [Connect Button]                   │
│  [Flash Update!]                    │
└─────────────────────────────────────┘
```

---

## Testing Plan (Phase 5)

After Phases 2-4 are complete:

- [ ] JOTS firmware loads correctly when selected
- [ ] LAPS firmware loads correctly when selected
- [ ] Cannot connect without selecting product
- [ ] Flash succeeds for JOTS
- [ ] Flash succeeds for LAPS
- [ ] Product images display correctly
- [ ] Version numbers show correctly
- [ ] Error handling works (missing files, connection failures)

---

## Quick Start for Next Session

1. Read this file
2. Read `IMPLEMENTATION_PLAN.md` (Phase 2 section)
3. Read `PROJECT_LOG.md` (Session 2 summary)
4. Start with Task 1: Update Vue.js data model in `app/app.js`
5. Test after each change
6. Update PROJECT_LOG.md when phase complete

---

## Key Files to Work With

### Phase 2 (Backend):
- `app/app.js` - Main application logic (primary file)
- `builds/products.json` - Product data source

### Phase 3 (Frontend):
- `app/app.js` - Vue template section (lines 144-303)
- `app/style.css` - Product card styling

### Reference:
- `IMPLEMENTATION_PLAN.md` - Detailed phase breakdown
- `PROJECT_LOG.md` - Session history
- `builds/README.md` - Firmware management guide

---

## Important Notes

- **Browser**: Must use Chrome (WebUSB requirement)
- **Testing**: Use local server (`run.sh` script)
- **Bootloader**: JOTS uses Footswitch, LAPS uses SHIFT button
- **Architecture**: Single products.json, no metadata.json files
- **Products**: Only JOTS and LAPS (Night Passage removed)

---

**Last Updated**: 2026-02-05
**Ready For**: Phase 2 Implementation
**Estimated Time**: 1-2 hours for Phase 2
