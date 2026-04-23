# Time Stretch X Resources

This folder contains embedded resources for the plugin.

## Structure

```
Resources/
├── Fonts/
│   ├── Inter-Regular.ttf
│   ├── Inter-Bold.ttf
│   └── JetBrainsMono-Regular.ttf
└── Images/
    ├── icon_512.png
    ├── icon_128.png
    └── (other UI images)
```

## Adding Fonts

1. Download Inter font from: https://fonts.google.com/specimen/Inter
2. Download JetBrains Mono from: https://www.jetbrains.com/lp/mono/
3. Place TTF files in the Fonts/ directory
4. Uncomment the binary data section in CMakeLists.txt

## Adding Images

1. Create plugin icon at 512x512 and 128x128 pixels
2. Use PNG format with transparency
3. Uncomment the ICON_BIG and ICON_SMALL lines in CMakeLists.txt
