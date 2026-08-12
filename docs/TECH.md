# TECH.md — Technical architecture

## 1. Stack

Use:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- npm
- Vercel for deployment

Do not add a component framework by default.

Do not add:

- database;
- CMS;
- authentication;
- Cloudinary SDK;
- animation framework;
- global state library;

unless the user explicitly requests it.

## 2. Project shape

Recommended structure:

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    layout/
    sections/
    ui/
  data/
    site.ts
    images.ts
    program.ts
    partners.ts
    faq.ts
  lib/
    utils.ts
public/
  branding/
    fpt-logo.*
    ico-logo.*
    favicon.*
docs/
.github/
```

Only create folders actually needed.

## 3. Page architecture

MVP is one page: `/`.

Navigation uses anchors such as:

- `#about`
- `#experience`
- `#program`
- `#expo`
- `#partners`
- `#venue`
- `#faq`
- `#register`

Do not create separate routes until requested.

## 4. Data architecture

### `site.ts`

Store stable content/settings:

```ts
export const siteConfig = {
  name: "FPT ICO Summit 2026",
  domain: "https://fpticosummit.com",
  dates: "20–22 November 2026",
  venue: "FPT University Can Tho Campus",
  address: "600 Nguyen Van Cu Noi Dai, An Binh, Can Tho City, Vietnam",
  email: "FPTUCT.HTQT@fe.edu.vn",
  campus360Url: "https://cantho.fpt.edu.vn/360-tour/",
  registrationUrl: "",
}
```

If `registrationUrl` is empty, render "Registration opens soon" instead of a dead link.

### `images.ts`

Centralize all photographic URLs:

```ts
export type SiteImage = {
  src: string | null
  alt: string
  credit?: string
  placeholderLabel?: string
}

export const images = {
  hero: {
    src: null,
    alt: "Students connecting at an international university event",
    placeholderLabel: "Hero image",
  },
}
```

Components must handle `src: null` gracefully.

### `partners.ts`

Suggested shape:

```ts
export type PartnerStatus = "confirmed" | "pending" | "invited" | "hidden"

export type Partner = {
  name: string
  country: string
  type: "university" | "consulate" | "organization" | "sponsor"
  logo: string | null
  status: PartnerStatus
  website?: string
}
```

Public render rule:

```ts
partners.filter((partner) => partner.status === "confirmed")
```

## 5. Cloudinary strategy

Cloudinary is used as the image/media library.

For MVP:

- upload manually in Cloudinary dashboard;
- copy final delivery URL;
- place URL in `src/data/images.ts` or `src/data/partners.ts`;
- do not implement upload APIs;
- do not expose Cloudinary API secrets;
- do not install Cloudinary SDK.

Recommended Cloudinary folder structure is defined in `docs/ASSETS.md`.

## 6. Next Image

Use `next/image` for standard website images.

Configure Cloudinary in `next.config.ts` using a restrictive `remotePatterns` rule once the Cloudinary cloud name is known.

Example pattern shape:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
      pathname: "/YOUR_CLOUD_NAME/**",
    },
  ],
},
```

Replace `YOUR_CLOUD_NAME` with the real Cloudinary cloud name.

## 7. Image placeholder behavior

Create a reusable visual placeholder for missing media. It should:

- preserve the intended aspect ratio;
- use neutral brand-compatible background;
- show a small label such as `Hero image pending` only in development/pre-production if appropriate;
- never show a broken image icon;
- be easy to replace when `src` becomes available.

## 8. 360 tour

Venue CTA:

- label: `Explore Campus in 360°`
- external target: `https://cantho.fpt.edu.vn/360-tour/`
- open in new tab
- no iframe for MVP

## 9. SEO

Set metadata in `app/layout.tsx` or appropriate metadata export:

- title: `FPT ICO Summit 2026 | FPT University Can Tho`
- description: concise international education/culture event description
- canonical domain: `https://fpticosummit.com` after domain is connected
- Open Graph image: use a dedicated Cloudinary asset when ready

A structured Event schema may be added once public dates/details are confirmed. Do not invent organizer URLs, ticket status, or offer prices.

## 10. Accessibility

Must include:

- semantic section headings;
- skip link;
- keyboard-visible focus;
- accessible nav toggle;
- alt text;
- good contrast;
- buttons vs links used correctly;
- `aria-label` only where semantics are not already clear;
- reduced-motion support.

## 11. Performance

- Hero image: preload/priority only if it is the actual LCP media.
- Every responsive `Image` using `fill` needs an accurate `sizes` attribute.
- Do not use huge raw images locally.
- Keep client-side JS minimal.
- Avoid carousels unless explicitly requested.
- Partner logos should use consistent bounded dimensions without causing layout shift.
