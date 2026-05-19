# PlantBuddy - Product Document

> PlantBuddy is a trusted plant marketplace and care network where people can sell, gift, swap, and temporarily place plants with local sitters.

This document defines the product vision, core loops, and planned scope. Implementation status and technical notes live in the docs folder.

---

## 1. Product Vision

Most plant apps do one thing well and stop there.

- Plant shops help you buy new plants.
- Resale marketplaces help you list almost anything, but give plants no special care context.
- Care platforms are built for pets, not living collections of houseplants with specific routines.

PlantBuddy combines all three.

It is a marketplace for plant people who want to:

- sell a plant,
- give a plant away,
- trade plants with another collector,
- or find someone trustworthy to care for a plant while they travel.

The product thesis is simple:

**A plant is not just an object.**

It has identity, condition, care needs, emotional value, and in many cases a story. The platform should treat it that way.

---

## 2. Core Promise

PlantBuddy helps users do two things confidently:

1. Discover and move plants between people.
2. Trust other people with living plants.

That means PlantBuddy must be good at both:

- marketplace mechanics: listings, search, prices, offers, urgency, favorites,
- and care mechanics: routines, dates, expectations, reviews, trust signals, handoff coordination.

---

## 3. Positioning

### Category

PlantBuddy is a peer-to-peer plant commerce and care platform.

### Mental model

If a resale marketplace and a care-booking platform had a plant-native child, it would look like PlantBuddy.

### Who it is for

- Houseplant collectors
- Casual plant owners
- People moving house or downsizing
- People traveling and needing temporary care
- Plant hobbyists who want extra income as sitters
- Community-minded users who like gifting or swapping instead of discarding

---

## 4. Problems Worth Solving

### Problem A: Plant resale is poorly structured

General marketplaces treat plants like random household goods. Listings often lack species names, care information, condition notes, and pickup expectations.

### Problem B: Rehoming a plant feels risky

When someone gifts away a beloved plant, they often care more about the next home than the transaction value. Current platforms do not support that emotional decision well.

### Problem C: Travel creates plant-care stress

People leave for weekends, holidays, work trips, or emergencies and need someone who actually understands plant care, not just someone who can pour water occasionally.

### Problem D: Trust is thin in current options

Plant exchange often happens informally through DMs, local groups, or mixed-purpose marketplaces with weak identity, poor reviews, and no structured handoff flow.

---

## 5. Product Concept

PlantBuddy gives each plant an identity profile, then lets the owner publish that plant in one of several modes.

### A plant profile includes

- Name
- Species / variety
- Description
- Condition
- Size
- Location notes
- Light requirements
- Watering cadence
- Humidity notes
- Special instructions
- Photos
- Optional story or personality notes

### From that profile, the owner can publish:

| Mode | What it means |
|---|---|
| Sell | Permanent transfer for money |
| Gift | Permanent transfer for free |
| Swap | Exchange for another plant |
| Need sitter | Temporary care arrangement |

This single-inventory, multi-intent model is the heart of the product.

---

## 6. Primary User Roles

Users can activate multiple roles on one account.

| Role | Capabilities |
|---|---|
| Owner | Create plant profiles and publish listings |
| Buyer / Adopter | Save, message, request, and acquire plants |
| Swapper | Propose exchange deals |
| Sitter | Offer temporary plant care services |

Roles are additive, not exclusive. A user may sell one plant, adopt another, and sit for someone else's collection in the same month.

---

## 7. Core Loops

### Loop A: Sell a plant

```text
Create plant profile
  -> Publish as Sell
    -> Buyers discover listing
      -> Message or make offer
        -> Agree pickup / delivery
          -> Complete transfer
            -> Leave review
```

### Loop B: Gift a plant

```text
Create plant profile
  -> Publish as Gift
    -> Interested adopters respond
      -> Owner chooses best home
        -> Coordinate handoff
          -> Mark rehomed
            -> Leave review
```

### Loop C: Swap plants

```text
Create plant profile
  -> Publish as Swap
    -> Another owner proposes exchange
      -> Both compare profiles and conditions
        -> Agree swap
          -> Complete handoff
            -> Review each other
```

### Loop D: Find a sitter

```text
Create plant profile
  -> Publish as Need sitter
    -> Sitters browse and apply
      -> Owner reviews sitter trust signals
        -> Confirm booking details
          -> Handoff plant or arrange home visits
            -> Sitter sends updates
              -> Booking completes
                -> Both leave reviews
```

---

## 8. User Experience Pillars

### 1. Listings first

The product should feel alive with fresh activity. Users should always see plants, people, and opportunities quickly.

### 2. Plant-native context

Every listing should answer plant-specific questions fast:

- What is it?
- How healthy is it?
- What does it need?
- How hard is it to care for?

### 3. Trust everywhere

Trust cannot be bolted on. Reviews, verification, response rate, care history, and clear steps must appear before risk-heavy actions.

### 4. One inventory, many outcomes

Users should not rebuild the same plant from scratch for every flow. A plant profile is reusable infrastructure.

---

## 9. Marketplace Mechanics

To work as a discovery engine, PlantBuddy needs the strongest parts of marketplace behavior.

### Browse features

- Dense listing feed
- Search by species, nickname, location, and care need
- Filters for mode, price, rarity, light, watering, pet safety, distance, and size
- Saved searches and favorites
- Freshness indicators for new listings

### Listing mechanics

- Publish and unpublish quickly
- Relist from archived inventory
- Mark reserved or completed
- Offer price for sale listings
- Offer a swap proposal for swap listings
- Request or apply for care on sitter listings

### Merchandising behavior

- Curated collections such as `Low light`, `Pet safe`, `Collector cuts`, `Free this week`, and `Needs a sitter soon`
- Seasonal and local discovery moments
- Editorial plant guidance built into listing details and collections

---

## 10. Trust and Safety Model

PlantBuddy needs a stronger trust layer than a generic classified app.

### Trust signals

- Verified identity badge
- Review score and review count
- Response speed and response rate
- Completed sales, swaps, gifts, and sits
- Repeat interactions
- Plant specialty tags such as `aroids`, `succulents`, `propagation`, `rare tropicals`

### Trust features

- Structured booking or handoff flow
- Meet-and-greet support for sitter arrangements
- Clear cancellation rules for sitter bookings
- In-app messages attached to listings and bookings
- Report and moderation tools

### Why this matters

The platform only works if users believe:

- the plant will be described honestly,
- the other person will show up,
- the sitter understands the care routine,
- and bad behavior will leave a visible reputation trail.

---

## 11. Sitter Network Model

The sitter side of the product is what makes PlantBuddy defensible and emotionally useful.

### Sitter profile should include

- Display name and location
- Bio
- Experience level
- Preferred plant types
- Travel radius
- Availability calendar
- Optional day rate or flat booking rate
- Reviews from completed bookings

### Care service formats

PlantBuddy should support two sitter models over time:

| Service | Description |
|---|---|
| Plant boarding | Plant stays with the sitter temporarily |
| Home visits | Sitter visits the owner's home to care for plants in place |

The initial MVP can focus on plant boarding because it maps cleanly to the current data model and UI flow.

---

## 12. MVP Recommendation

The full concept is broad, so the MVP should focus on the strongest wedge.

### MVP phase 1

- Authentication
- Plant profiles
- Sell / Gift / Need sitter listing modes
- Listing discovery feed
- Basic messaging or application flow
- Owner review of responses
- Basic profile and review system

### MVP phase 2

- Swap proposals
- Saved searches
- Favorites
- Better sitter availability and pricing
- Completed handoff and booking states

### MVP phase 3

- Payment handling
- Home-visit sitter flow
- Verified identity flow
- Stronger moderation tools
- Insurance / guarantee style protection if commercially viable

---

## 13. Why This Product Can Win

PlantBuddy is stronger than a generic resale app because it understands the thing being exchanged.

It is stronger than a plant store because it supports peer-to-peer movement, not just retail purchase.

It is stronger than an informal care arrangement because it turns trust into product infrastructure.

Its edge is not just inventory. Its edge is structured trust around living items.

---

## 14. Representative User Stories

### The downsizer

`I am moving to a smaller flat and need to rehome six plants without throwing them away.`

### The collector

`I want to trade one duplicate cutting for something unusual nearby.`

### The traveler

`I am away for twelve days and need someone competent to care for my calathea and monstera.`

### The side-income sitter

`I already have a healthy indoor setup and can earn money helping local owners with their plants.`

### The beginner

`I want an easy first plant and a platform that teaches me what I am taking home.`

---

## 15. Product Principles

- Treat every plant as an identity, not a SKU.
- Favor structured listings over free-form chaos.
- Build trust before growth hacks.
- Let the same plant move through multiple lifecycle states.
- Keep the experience emotionally warm and operationally clear.

---

## 16. Product Surface Areas

### User-facing surfaces

- Explore feed
- Listing detail
- Add / edit plant
- Publish listing flow
- Sitter application flow
- Inbox and coordination
- Profile and reputation

### System surfaces

- Authentication
- Roles and permissions
- Reviews
- Moderation
- Notifications
- Search and filtering
- Storage for plant photos

---

## 17. Commercial Model Options

PlantBuddy can evolve into one or more revenue streams:

- Service fee on sitter bookings
- Promoted listings for sellers
- Verified or pro sitter subscription
- Plant shop or nursery partnerships
- Premium analytics for high-volume sellers or stores

These should remain secondary to trust. Monetization that weakens reliability will damage the core loop.

---

## 18. How This Maps To The Current Build

The current codebase already points toward a strong first wedge:

- user authentication,
- plant profiles,
- listing flows,
- and the sitter application concept.

That means the current implementation should be treated as the foundation for `Need sitter`, then expanded outward into `Sell`, `Gift`, and `Swap` using the same plant profile backbone.

This is the right order because it builds the hardest trust layer first.

---

## 19. Long-Term Vision

In its strongest form, PlantBuddy becomes the default place to move plants between people responsibly.

Not just buy them.
Not just sell them.
Not just browse them.

Move them, care for them, and trust other people with them.
