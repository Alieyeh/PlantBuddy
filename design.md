# PlantBuddy - Design System and Experience Guide

> This document defines the visual language, interaction model, and UX intent for PlantBuddy as a hybrid of a listings marketplace and a trusted plant-care network.

---

## 1. Product Feeling

PlantBuddy should feel like three worlds meeting in one place:

- A lively peer-to-peer marketplace where fresh listings feel immediate and desirable.
- A knowledgeable plant boutique where every listing teaches you something about the plant.
- A trusted care platform where handing a living thing to someone else feels safe.

This is not a generic buy-and-sell app with a leaf icon. It is also not a sleepy plant catalog. It is a living marketplace for people who buy, rehome, gift, swap, and temporarily entrust plants to other people.

Three design principles should govern every screen:

- Fast to browse.
- Warm to read.
- Safe to act.

---

## 2. Brand Direction

### Brand personality

PlantBuddy is:

- Earthy, but not rustic.
- Modern, but not sterile.
- Community-driven, but not chaotic.
- Trustworthy, but not corporate.

### Visual metaphor

Think greenhouse market, Sunday plant fair, handwritten care cards, ceramic pots, linen wraps, tray labels, and sunlight on painted walls.

### Words the interface should evoke

- Fresh
- Local
- Lush
- Reliable
- Human

---

## 3. Experience Thesis

The experience should combine:

- Marketplace density from resale apps: lots of browseable cards, filters, saved searches, visible pricing, clear listing states.
- Plant fluency from specialist plant shops: species names, care icons, light and watering context, curated categories, tasteful presentation.
- Trust infrastructure from care platforms: verified profiles, reviews, response rates, meet-and-greet moments, clear booking flow.

The result should feel like:

- "I can discover something interesting in 10 seconds."
- "I understand what this plant needs in 20 seconds."
- "I trust this person enough to transact or coordinate care."

---

## 4. Visual System

### Color palette

| Token | Value | Usage |
|---|---|---|
| `forest` | `#1E3A2F` | Primary brand, headers, important CTAs |
| `canopy` | `#315B46` | Secondary green, tabs, active filters |
| `moss` | `#6F8F6D` | Support text, icons, outlines |
| `sage` | `#B8C8B0` | Borders, chips, inactive states |
| `cream` | `#F6F1E8` | App background |
| `parchment` | `#EFE6D8` | Secondary surfaces |
| `pot` | `#C97B52` | Accent CTA, highlights, progress states |
| `terracotta` | `#A85736` | Destructive actions, warnings |
| `petal` | `#EBC8B4` | Soft alerts, status fills |
| `sun` | `#E2B94F` | Premium accents, badges |
| `ink` | `#18201B` | Primary text |
| `slate` | `#59645D` | Secondary text |
| `stone` | `#938E84` | Placeholder, quiet metadata |
| `white` | `#FFFFFF` | Card surfaces |

### Color rules

- Backgrounds should feel warm, never flat grey.
- Greens should skew botanical, not default Material green.
- The accent color should be terracotta rather than blue or purple.
- Trust states should use muted, grown-up colors instead of loud marketplace neon.

### Status mapping

| State | Background | Text |
|---|---|---|
| Available | `#E8F0EA` | `#315B46` |
| For sale | `#F6E8DD` | `#A85736` |
| Free / gift | `#F3F0D9` | `#6A6A2E` |
| Swap | `#E7E3F3` | `#5A4B86` |
| Needs sitter | `#FBE3D4` | `#A85736` |
| Reserved | `#E8E4DC` | `#6B675F` |
| Completed | `#E2ECE6` | `#315B46` |

---

## 5. Typography

### Font pairing

| Role | Font | Weights | Use |
|---|---|---|---|
| Display | Fraunces | 600, 700, 800 | Hero lines, section titles, plant names |
| UI / Body | Bricolage Grotesque | 400, 500, 600, 700 | Navigation, body, labels, cards |
| Data | JetBrains Mono | 400 | Distances, prices, dates, IDs |

### Type scale

| Token | Size | Weight | Use |
|---|---|---|---|
| `hero` | 38 | 800 | Landing headers |
| `h1` | 30 | 700 | Main screen titles |
| `h2` | 22 | 700 | Plant names, section titles |
| `h3` | 18 | 600 | Card headings |
| `body` | 15 | 400 | Main content |
| `label` | 13 | 600 | Inputs, filters |
| `caption` | 11 | 500 | Metadata |
| `badge` | 10 | 700 | Chips and status pills |

### Typography rules

- Large serif headlines create warmth and memorability.
- Marketplace information should still scan quickly, so metadata stays sans-serif.
- Plant names can be expressive; transactional text must stay crisp.

---

## 6. Layout, Shape, and Motion

### Spacing scale

| Token | Value |
|---|---|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `base` | 16 |
| `lg` | 20 |
| `xl` | 24 |
| `xxl` | 32 |
| `xxxl` | 48 |

### Radius rules

| Element | Radius |
|---|---|
| Cards | 18 |
| Inputs | 12 |
| Buttons | 14 |
| Chips | 999 |
| Sheets | 28 top only |

### Shadows

Use warm shadows tinted toward green-brown, not cool grey:

```js
{
  shadowColor: '#1E3A2F',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
}
```

### Motion rules

- Listing cards should stagger in gently on first load.
- Save, apply, and book actions should feel tactile with a subtle press scale.
- Trust badges and state changes should fade, not flash.
- Avoid over-animating tabs, filters, and input focus.

---

## 7. Navigation Model

PlantBuddy should feel listing-first.

### Primary tabs

| Tab | Purpose |
|---|---|
| My Plants | Manage owned plants and active listings |
| Browse | Browse plants and open sitting, gift, sale, and swap listings |
| Exchanges | Applications, swap proposals, handoff updates, and completed exchanges |
| Profile | Identity, ratings, roles, saved searches; planned but not implemented yet |

Current implementation note: the Expo app currently ships `My Plants`, `Browse`, and `Exchanges` as the authenticated bottom tabs. The bottom tab bar should use a raised rounded surface, warm borders, and clear shape-based icons rather than fragile emoji glyphs.

### Global CTA

A persistent floating action button should open a creation sheet with:

- Add plant
- Sell plant
- Gift plant
- Swap plant
- Find a sitter

This is the core mental model: one inventory of plants, multiple intentions.

---

## 8. Content Architecture

### Listing modes

Every plant can be published in one of four primary modes:

| Mode | User intent | UI emphasis |
|---|---|---|
| Sell | Permanent transfer for money | Price, condition, pickup/delivery |
| Gift | Permanent transfer for free | Good-home framing, urgency |
| Swap | Exchange plants | Match interest, rarity, equivalence |
| Need sitter | Temporary care arrangement | Dates, care routine, trust signals |

### Listing card anatomy

All listing cards should follow a scan-friendly pattern:

1. Photo block
2. Mode badge
3. Plant name
4. Species or variety
5. Price or date range
6. Care chips
7. Seller or sitter trust row
8. Location / distance / freshness

The card should work in a dense grid for marketplace browsing and as a stacked card in care-specific views.

---

## 9. Trust Design

Trust is not a single screen. It is layered into every interaction.

### Trust signals to surface everywhere relevant

- Verified profile badge
- Response rate
- Response speed
- Completed handoffs or care bookings
- Review count and average rating
- Repeat buyers / repeat owners
- Plant care specialties
- Meet-and-greet completed

### Trust moments

| Moment | Interface behavior |
|---|---|
| First contact | Show profile badges and reviews before message composer |
| Applying to sit | Show care expectations and owner rules clearly |
| Accepting sitter | Require explicit confirmation with next steps |
| Completing a transfer | Prompt review and outcome logging |

### Safety tone

Write trust copy like a calm host, not a legal disclaimer. The interface should reassure without sounding anxious.

---

## 10. Screen Intent

### Explore

**Feeling:** A plant market that is alive right now.

- Dense listing feed with fast-scanning cards.
- Filter rail for mode, price, light, pet safe, rarity, distance, and availability.
- Search should support species, nickname, location, and care needs.
- Hero section can rotate between curated collections such as `Low light`, `Rare finds`, `Needs a sitter this week`, and `Free to a good home`.

### Listing detail

**Feeling:** Boutique plant page meets trusted booking page.

- Large visual header.
- Immediate mode badge and key action.
- Care summary near the top, not hidden at the bottom.
- Owner or seller profile block with trust stats.
- Sticky action bar.

### My Plants

**Feeling:** Your greenhouse control panel.

- Inventory grouped by `At home`, `Listed`, `With sitter`, `Completed transfers`.
- Quick relist actions.
- Listing performance stats on each active card.
- CTA should nudge users to publish idle plants.

### Add / Edit Plant

**Feeling:** Creating a premium care card, not filling out a database form.

- Break the form into clear sections: Identity, Condition, Care, Logistics.
- Use helper text that sounds like a knowledgeable plant friend.
- Keep a visual plant-profile hero at the top and care preview tiles near the care fields.
- Photo upload should feel first-class because imagery drives discovery.

### Sitter discovery

**Feeling:** Searching for a trusted local expert.

- Sitter cards should prioritize experience, review quality, availability, and plant specialties.
- Optional map view for local discovery.
- Clear distinction between `plant collector who can help` and `professional-style sitter`.

### Inbox

**Feeling:** Calm coordination, not noisy chat.

- Segment by `Applications`, `Bookings`, `Messages`, `Offers`.
- Important state changes should appear as structured system rows.
- Payments, dates, and status should be visible without opening every thread.

### Profile

**Feeling:** A public reputation layer.

- Show bio, badges, reviews, response data, and plant specialties.
- Role toggles should be additive: seller, giver, swapper, sitter.
- Saved searches and favorite plants belong here.

---

## 11. Component Guidelines

### Listing cards

- White or parchment surface.
- Large photo first.
- Mode badge over image.
- Metadata rows should be short and scannable.
- Use chips for care facts: light, watering cadence, pet-safe, rare.

### Buttons

| Type | Style |
|---|---|
| Primary | Filled forest or terracotta |
| Secondary | White with forest border |
| Trust action | Filled parchment with forest text |
| Destructive | White with terracotta border |

### Inputs

- No floating labels.
- Label above field.
- Clear validation and human error text.
- Use segmented selectors for listing mode rather than raw dropdowns.
- Natural-language fields should request spellcheck, autocorrect, autocomplete, and text/search input modes. Visible suggestions still depend on browser and operating-system settings.

### Chips

Use chips aggressively for browse speed:

- `Low light`
- `Pet safe`
- `Needs weekly watering`
- `Pickup only`
- `Rare`
- `Needs sitter soon`

### Review module

- Average score large and prominent.
- Short review snippets visible without tapping.
- Highlight keywords such as `communicative`, `careful`, `healthy plants`, `smooth pickup`.

---

## 12. Visual Tone by Listing Mode

Different modes should feel related but distinct.

### Sell

- More structured pricing emphasis.
- Condition and shipping/pickup information visible early.

### Gift

- Softer copy and more community-forward tone.
- Emphasize finding the right home rather than speed.

### Swap

- Encourage curiosity and comparison.
- Use paired-card layouts for proposals.

### Need sitter

- Emphasize dates, routine, trust, and care detail.
- Use availability and verification modules more prominently.

---

## 13. Writing Style

### Voice

PlantBuddy copy should be:

- Clear
- Warm
- Slightly playful
- Specific

### Examples

- Use `Find a sitter` instead of `Create service request`.
- Use `Free to a good home` instead of `Donation listing`.
- Use `Healthy, pushing new growth` instead of `Status: good`.
- Use `Message owner` instead of `Open conversation`.

### Error style

Errors should explain what failed and what to do next:

- `Your plant needs a name before it can be listed.`
- `We could not publish this listing. Check your connection and try again.`
- `This sitter request needs start and end dates.`

---

## 14. Accessibility Rules

- Tap targets must be at least 44 x 44.
- Metadata chips must remain readable at large text settings.
- Color must never be the only status signal.
- Images need meaningful alt-equivalent labels in web contexts.
- Motion should respect reduced-motion settings.

---

## 15. What To Avoid

- No generic fintech blue.
- No default app-store green gradients.
- No cluttered admin-style forms.
- No overly cute cartoon plant mascots.
- No splitting the product into separate apps or visual systems for marketplace vs care.

The power of PlantBuddy is that the same plant can move through multiple modes over time. The design system must make that feel natural.
