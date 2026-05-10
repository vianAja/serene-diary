---
name: Digital Journaling System
colors:
  surface: '#faf9f9'
  surface-dim: '#dadada'
  surface-bright: '#faf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e9e8e8'
  surface-container-highest: '#e3e2e3'
  on-surface: '#1a1c1c'
  on-surface-variant: '#41484a'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f0f1'
  outline: '#72787a'
  outline-variant: '#c1c7ca'
  surface-tint: '#45636c'
  primary: '#45636c'
  on-primary: '#ffffff'
  primary-container: '#89a8b2'
  on-primary-container: '#1f3d46'
  inverse-primary: '#acccd6'
  secondary: '#4e6268'
  on-secondary: '#ffffff'
  secondary-container: '#cee3ea'
  on-secondary-container: '#52666c'
  tertiary: '#795740'
  on-tertiary: '#ffffff'
  tertiary-container: '#c49a80'
  on-tertiary-container: '#4f321e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8e8f3'
  primary-fixed-dim: '#acccd6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#2d4b54'
  secondary-fixed: '#d1e6ed'
  secondary-fixed-dim: '#b5cad1'
  on-secondary-fixed: '#0a1e24'
  on-secondary-fixed-variant: '#364a50'
  tertiary-fixed: '#ffdcc7'
  tertiary-fixed-dim: '#ebbda2'
  on-tertiary-fixed: '#2d1505'
  on-tertiary-fixed-variant: '#5f402b'
  background: '#faf9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e3e2e3'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1200px
  gutter: 20px
  margin-mobile: 16px
---

## Brand & Style

The design system is centered on the concept of "Digital Mindfulness." It prioritizes a serene, low-cognitive-load environment that encourages daily reflection and habit consistency. The brand personality is gentle, observant, and dependable—evoking the feeling of high-quality tactile stationery translated into a digital medium.

The design style follows a **Soft Minimalism** approach. It avoids harsh contrasts and cluttered interfaces in favor of intentional whitespace, a muted "paper-like" color palette, and subtle depth. Elements should feel light and airy, utilizing soft shadows and generous padding to create a sense of organized calm.

## Colors

The palette is derived from natural, muted tones to reduce eye strain and promote tranquility. 

- **Primary (#89A8B2):** Used for key actions, active states, and primary brand moments. It is a calming blue that provides clear affordance without being aggressive.
- **Secondary (#B3C8CF):** Utilized for decorative elements, progress bars, and secondary buttons. It bridges the gap between the primary action color and the background.
- **Accent (#E5E1DA):** A warm beige used for subtle highlights, background groupings, or as a "paper" texture alternative for card surfaces.
- **Background (#F1F0E8):** An off-white base that acts as the canvas, providing a softer, more organic feel than pure white.
- **Surface (#FFFFFF):** Used for cards and elevated containers to create a distinct layer of information over the off-white background.

## Typography

This design system uses **Manrope** for its modern, balanced, and highly legible characteristics. It offers a professional yet approachable feel that suits a digital journal.

- **Hierarchy:** Large headlines use a heavier weight and tighter letter spacing to create a sense of structure.
- **Readability:** Body text uses a generous line height (1.5x) to ensure that long-form diary entries remain comfortable to read.
- **Labels:** Small labels and metadata use a slightly increased letter spacing and semi-bold weight for clarity at small scales.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a fixed maximum width for desktop to maintain optimal line lengths for reading. 

- **Desktop:** A 12-column grid with 24px gutters. Dashboard widgets and journal entries should typically span 4, 6, or 8 columns depending on content density.
- **Mobile:** A 4-column grid with 16px margins. Components reflow into a single vertical stack.
- **Rhythm:** Use a 4px baseline shift for vertical rhythm. Containers and cards should utilize 'lg' (24px) padding to maintain an open, airy feeling.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering** rather than heavy borders.

- **Level 0 (Base):** The Background color (#F1F0E8).
- **Level 1 (Surface):** Cards and main content containers use the Surface color (#FFFFFF) with a very soft, diffused shadow: `0px 4px 12px rgba(137, 168, 178, 0.08)`.
- **Level 2 (Interaction):** Hover states or active modals increase shadow depth to `0px 8px 24px rgba(137, 168, 178, 0.12)` to "lift" the element closer to the user.
- **Depth Tints:** Shadows are subtly tinted with the Primary Blue color to maintain harmony with the palette.

## Shapes

The design system uses a **Rounded** shape language to reinforce the friendly and approachable brand personality.

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Main dashboard widgets and journal entry cards use a 1rem (16px) radius to create a softer, more "journal-like" aesthetic.
- **Pills:** Habit trackers and status tags use a fully rounded (pill) shape to differentiate them as interactive or categorizing elements.

## Components

- **Buttons:** Primary buttons use the Primary Blue with white text. Secondary buttons use the Soft Beige with the Primary Blue text. All buttons feature a 0.5rem radius and subtle transitions on hover.
- **Cards:** Cards are the primary vessel for habit streaks and journal snippets. They must have a white background, soft shadow, and 'lg' internal padding.
- **Habit Trackers:** Use a horizontal "streak" visualization. Completed days should use a solid Primary Blue circle, while upcoming days use a Light Blue-Grey outline.
- **Input Fields:** Text areas for journaling should have no borders, only a subtle Soft Beige bottom-border that glows Primary Blue when focused, mimicking a lined notebook.
- **Chips/Tags:** Used for mood tracking (e.g., "Calm", "Productive"). These are pill-shaped with a Light Blue-Grey background and darker text.
- **Progress Indicators:** Use soft, rounded bars. The "track" is the Accent color, and the "fill" is a gradient of Secondary to Primary Blue.