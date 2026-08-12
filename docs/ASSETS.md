# ASSETS.md — Image, logo and Cloudinary plan

## 1. Asset strategy

Priority order for final website imagery:

1. **Official/internal FPT University Can Tho photos**
2. **Photos from prior FPT international/cultural/education events** with permission to reuse
3. **Assets supplied directly by participating universities, consulates and organizations**
4. **Official partner media/brand kits** when usage is permitted
5. **Licensed stock photography** only where authentic FPT/event imagery is not yet available

Stock images are acceptable as **temporary development placeholders**, but generic stock must never be labeled as a real FPT event, real partner, or real attendee.

## 2. Where to search for temporary stock

Good temporary sources:

- Unsplash
- Pexels

Before public launch, prefer real FPT/Summit assets whenever possible.

Do not scrape random Google Images.

## 3. Cloudinary folder structure

Recommended:

```text
fpt-ico-summit/
  branding/
  homepage/
    hero/
    pillars/
    experience/
  campus/
  mekong/
  program/
  cultural/
  partners/
    universities/
    consulates/
    organizations/
    sponsors/
  speakers/
  news/
  social/
```

Recommended public IDs:

```text
hero-international-students-01
pillar-cultural-exchange-01
experience-international-expo-01
experience-workshop-01
experience-performance-01
mekong-river-01
campus-main-01
partner-university-name
consulate-country-name
og-home-2026
```

Avoid filenames such as `IMG_9281`, `final2`, `image-new-new`.

## 4. Required image slots for MVP

### Asset A01 — Hero image — MUST HAVE

**Section:** Hero  
**Use:** Main visual above the fold  
**Best final source:** Actual FPT students + international guests / intercultural university activity / strong FPT campus moment  
**Temporary search concepts:**

- `international university students campus asia`
- `multicultural students university`
- `asian university students international`

**Avoid:** corporate handshakes, business suits, isolated stock portraits  
**Composition:** people grouped on right/center with some negative space for crop flexibility  
**Preferred ratio:** 16:10 or 3:2  
**Target source size:** at least ~2400px wide  
**Cloudinary folder:** `homepage/hero/`

### Asset A02 — Connect Cultures

**Section:** Pillars / About  
**Subject:** Vietnamese + international students interacting naturally  
**Temporary search:** `international students cultural exchange`, `multicultural university students`  
**Ratio:** 4:3  
**Target:** 1600×1200 or larger  
**Cloudinary:** `homepage/pillars/`

### Asset A03 — Global Study / Consultation

**Section:** Pillars / Experience  
**Subject:** students discussing study opportunities with an advisor, university booth, education consultation  
**Temporary search:** `university education fair students`, `student advisor university`, `study abroad fair`  
**Ratio:** 4:3  
**Target:** 1600×1200+  
**Cloudinary:** `homepage/pillars/` or `homepage/experience/`

### Asset A04 — Global Partnership / Institutional

**Section:** About / credibility  
**Subject:** real FPT international meeting, visiting delegation, campus partner discussion  
**Best source:** internal FPT photo archive  
**Do not use:** fake stock handshake as if it were a real partner meeting  
**Ratio:** 4:3 or 3:2  
**Cloudinary:** `homepage/pillars/`

### Asset A05 — International Expo

**Section:** Experience grid  
**Subject:** education fair / booths / students talking to exhibitors  
**Temporary search:** `university fair booth`, `education exhibition students`, `college fair`  
**Ratio:** 3:2  
**Target:** 1800px+ wide  
**Cloudinary:** `homepage/experience/`

### Asset A06 — Cultural Village

**Section:** Experience grid  
**Subject:** cultural craft/activity, traditional clothing, hands-on culture, international festival  
**Temporary search:** `international cultural festival students`, `traditional craft workshop`, `cultural exchange event`  
**Ratio:** 4:3  
**Cloudinary:** `cultural/`

### Asset A07 — Workshop / Academic learning

**Section:** Workshop  
**Subject:** university workshop, speaker + students, collaborative academic session  
**Temporary search:** `university workshop students`, `college lecture workshop`, `students seminar presentation`  
**Ratio:** 16:10 or 3:2  
**Target:** 1800px+ wide  
**Cloudinary:** `program/`

### Asset A08 — Cultural performance

**Section:** Experience / program  
**Subject:** stage performance, traditional costumes, music/dance  
**Best source:** previous FPT International Day / cultural event imagery if available  
**Temporary search:** `international cultural performance university`, `traditional dance stage students`  
**Ratio:** 3:2  
**Cloudinary:** `cultural/`

### Asset A09 — Mekong hero/story image — MUST HAVE

**Section:** Mekong  
**Subject:** authentic Can Tho/Mekong river life, boat, floating market, river landscape  
**Best source:** official/local photo with known permission  
**Temporary search:** `Mekong Delta Vietnam river boat`, `Can Tho floating market`, `Vietnam Mekong river`  
**Ratio:** panoramic 16:9 or 2:1  
**Target:** 2400px+ wide  
**Cloudinary:** `mekong/`

Important: if using a generic Mekong photo that is not Can Tho, do not caption it as a specific Can Tho landmark.

### Asset A10 — FPT University Can Tho campus — MUST HAVE

**Section:** Venue  
**Subject:** actual FPT University Can Tho campus exterior / recognizable campus view  
**Source:** internal/official FPT image only if possible  
**Do not substitute final version with a generic university campus photo**  
**Ratio:** 16:9  
**Target:** 2000px+ wide  
**Cloudinary:** `campus/`

### Asset A11 — Partner university logos

**Section:** Partners  
**Source:** partner-provided logo or official university brand/media kit  
**Format priority:** SVG > transparent PNG > WebP if needed  
**Background:** transparent preferred  
**Do not recolor official marks without permission**  
**Cloudinary:** `partners/universities/`

Only upload/display after status is confirmed for public listing.

### Asset A12 — Consulate / institutional logos

**Section:** Partners / Consulates  
**Source:** provided by consulate or verified official government source  
**Do not use unofficial recreated emblems**  
**Cloudinary:** `partners/consulates/`

Only upload/display after participation is confirmed.

### Asset A13 — Speakers

**Section:** future speaker cards  
**Current MVP:** do not render speaker cards unless speakers are confirmed  
**Source:** speaker/organization-provided headshot  
**Ratio:** 4:5 portrait  
**Cloudinary:** `speakers/`

### Asset A14 — Open Graph / social preview

**Section:** metadata/social sharing  
**Create later from approved branding + event image**  
**Ratio:** 1200×630  
**Cloudinary:** `social/`

## 5. Sections that do NOT need photos

Do not force imagery into:

- Stats Strip
- FAQ
- small feature lists
- registration status CTA
- footer

Use typography, icons and spacing instead.

## 6. Cloudinary upload checklist

For each image:

- use a meaningful public ID;
- keep the highest useful source quality;
- add alt text/description in project data, not only Cloudinary;
- save photographer/source/license note if stock;
- avoid uploading unnecessary duplicates;
- keep partner assets grouped by type;
- do not upload confidential/internal documents as website media.

## 7. Recommended temporary-image workflow

1. Build layout first with `src: null` placeholders.
2. Find one candidate image per asset ID A01–A10.
3. Confirm it is permitted for website use.
4. Upload to Cloudinary.
5. Copy URL into `src/data/images.ts`.
6. Check desktop + mobile crop.
7. Replace temporary stock with official FPT/event imagery when available.

## 8. Image-crop guidance

When choosing images, leave useful negative space and avoid faces at extreme edges. The same asset may be cropped differently on mobile and desktop.

Prefer:

- clear focal point;
- natural expressions;
- visible education/cultural context;
- real environments;
- enough background around people for responsive cropping.
