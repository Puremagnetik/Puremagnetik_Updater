# Firmware Builds Directory

This directory contains firmware files for Puremagnetik products powered by Electrosmith Daisy Seed.

## Directory Structure

```
builds/
├── products.json              # Product catalog (single source of truth)
├── night-passage/
│   ├── NightPassage_1_0_7.bin # Firmware binary (ADD THIS FILE)
│   └── CHANGELOG.md           # Version history (optional)
└── laps/
    ├── laps_1_0_7.bin         # Firmware binary (ADD THIS FILE)
    └── CHANGELOG.md           # Version history (optional)
```

**Note**: All product metadata is stored in `products.json`. There are no separate `metadata.json` files.

## Adding Firmware Files

### Step 1: Add Your Binary Files

You need to add the firmware `.bin` files to their respective directories:

1. **Night Passage**: Place `NightPassage_1_0_7.bin` in `builds/night-passage/`
2. **LAPS**: Place `laps_1_0_7.bin` in `builds/laps/`

### Step 2: Verify File Paths

Ensure the firmware files match the names specified in `products.json`:
- Night Passage: `builds/night-passage/NightPassage_1_0_7.bin`
- LAPS: `builds/laps/laps_1_0_7.bin`

### Step 3: Commit to Repository

```bash
git add builds/
git commit -m "Add firmware binaries for Night Passage and LAPS v1.0.7"
git push origin pm-custom
```

### Step 4: Deploy to GitHub Pages

Once pushed, the firmware will be available via GitHub Pages at:
- `https://yourusername.github.io/Daisy_Web_Programmer/builds/night-passage/NightPassage_1_0_7.bin`
- `https://yourusername.github.io/Daisy_Web_Programmer/builds/laps/laps_1_0_7.bin`

## products.json Schema

All product metadata is stored in a single `products.json` file:

```json
{
  "version": "1.0",
  "updated": "2026-02-05",
  "products": [
    {
      "id": "product-id",
      "name": "Product Name",
      "description": "Product description",
      "manufacturer": "Puremagnetik",
      "image": "builds/product-id/product-image.jpg",
      "platform": "seed",
      "firmware": {
        "version": "1.0.7",
        "release_date": "2026-01-14",
        "filename": "ProductName_1_0_7.bin",
        "url": "builds/product-id/ProductName_1_0_7.bin",
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
      "changelog_url": "builds/product-id/CHANGELOG.md",
      "installation_notes": "Hold SHIFT button while connecting USB cable to enter DFU bootloader mode.",
      "support_url": "https://puremagnetik.com/support",
      "documentation_url": "https://puremagnetik.com/products/product-name"
    }
  ]
}
```

## Adding a New Product

To add a new product to the updater:

1. Create a new directory: `builds/your-product-id/`
2. Add the firmware binary: `YourProduct_X_X_X.bin`
3. (Optional) Create `CHANGELOG.md` for human-readable version history
4. Update `products.json` to add the new product entry (see schema above)
5. Commit and push changes

## Updating Firmware Version

When releasing a new firmware version:

1. Add new `.bin` file to product directory
2. Update `products.json`:
   - Change `firmware.version`
   - Update `firmware.release_date`
   - Update `firmware.filename` and `firmware.url`
   - Add new entry to `changelog` array
3. (Optional) Update product's `CHANGELOG.md`
4. Commit and push changes

Example update:
```json
{
  "firmware": {
    "version": "1.0.8",
    "release_date": "2026-03-15",
    "filename": "NightPassage_1_0_8.bin",
    "url": "builds/night-passage/NightPassage_1_0_8.bin"
  },
  "changelog": [
    {
      "version": "1.0.8",
      "date": "2026-03-15",
      "changes": ["Bug fixes", "Performance improvements"]
    },
    {
      "version": "1.0.7",
      "date": "2026-01-14",
      "changes": ["Latest stable release"]
    }
  ]
}
```

## File Naming Convention

Use this naming pattern for firmware files:
```
ProductName_MAJOR_MINOR_PATCH.bin
```

Examples:
- `NightPassage_1_0_7.bin`
- `laps_2_1_0.bin`
- `NewProduct_1_0_0.bin`

## Git LFS (Large File Storage)

If firmware files exceed 50MB or you have many versions:

```bash
# Install Git LFS
git lfs install

# Track binary files
git lfs track "*.bin"

# Commit .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS for firmware binaries"
```

## Security Notes

- Firmware files are served over HTTPS via GitHub Pages
- No authentication required (public firmware updates)
- Consider adding SHA256 checksums to `firmware.checksum_sha256` for verification
- Future: Implement firmware signature verification

## Support

For questions or issues, contact: hello@puremagnetik.com
