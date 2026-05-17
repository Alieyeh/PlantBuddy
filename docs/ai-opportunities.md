# AI Opportunities For PlantBuddy

This document captures realistic ways PlantBuddy could incorporate AI later. The core MVP should still work without AI: users need to register, add plants, create sitting requests, apply, accept, and complete contracts first.

AI should be treated as an enhancement layer, not the foundation of the product.

## Best Early AI Ideas

### 1. Plant And Sitter Matching Assistant

AI could help rank or explain matches between plant owners and sitters.

Possible uses:

- Match plant care needs with sitter experience.
- Compare sitter availability with requested sitting dates.
- Suggest sitters who have handled similar plant types.
- Explain why a sitter is a good fit in plain language.
- Improve search beyond exact keyword matching.

Best practice:

- Use normal filters first: dates, location, availability, listing status, and user role.
- Use AI only for ranking, summarising, or explaining matches after the safe database filters have already run.
- Keep final booking decisions with the users.

Risks:

- Biased or unfair ranking.
- Incorrect match explanations.
- Overcomplicated implementation before the core marketplace works.

### 2. Smart Plant Profile Assistant

AI could help owners create better plant profiles from rough notes.

Possible uses:

- Turn messy notes into a clear plant bio.
- Suggest missing profile fields such as watering frequency or light needs.
- Rewrite care instructions so sitters can follow them easily.
- Generate a friendly plant personality paragraph if the product wants a playful tone.

Why this is a strong first AI feature:

- It is low risk.
- It does not make financial or safety decisions.
- It improves data quality for later matching.
- It gives a visible "AI" feature without making the app dependent on AI.

### 3. Listing And Application Writing Help

AI could help users write better sitting requests and sitter applications.

Possible uses:

- Help an owner describe what a sitter needs to do.
- Help a sitter write a friendly application message.
- Summarise long care instructions into a short checklist.
- Suggest clearer wording for dates, responsibilities, and expectations.

Best practice:

- Let users edit before posting.
- Clearly label generated text as a draft.
- Do not auto-submit AI-generated applications or listings.

### 4. Plant Care Guidance

AI could answer general care questions or help interpret plant care instructions.

Possible uses:

- "How should I care for this plant while the owner is away?"
- "What does bright indirect light mean?"
- "Can you turn these owner notes into a daily checklist?"

Best practice:

- Prioritise the owner's instructions over generic AI guidance.
- Make clear that AI care advice is general and may be wrong.
- Avoid letting AI override contract terms or owner-provided care requirements.

### 5. Search And Discovery

AI could improve search when the marketplace grows.

Possible uses:

- Semantic search for listings, plant types, and sitter profiles.
- Suggested filters based on natural language queries.
- Discovery prompts such as "low-maintenance plants near me" or "short weekend sitting requests".

Technical note:

- This could eventually use embeddings and a vector search table in Supabase.
- Start with regular SQL filters and add semantic search only when there is enough content to justify it.

## Later, More Playful Ideas

### Plant Personalities And Chat

Plants could have optional AI-generated personalities or chat modes.

Possible uses:

- A plant profile bio written in the plant's "voice".
- A playful chat where users can ask the plant about its care routine.
- A sitter-facing "care coach" that explains owner instructions through the plant personality.

Best practice:

- Keep this clearly playful.
- Do not make personality chat the source of truth for care, payments, safety, or contracts.
- Always keep the real owner-written care instructions visible.

### Mini Games

AI could support small retention features after the useful marketplace flow exists.

Possible uses:

- Plant care quizzes generated from a plant's profile.
- A daily care challenge for sitters.
- Educational games about watering, light, humidity, and pests.
- A virtual plant companion that grows as users complete real app actions.

Best practice:

- Mini games should not distract from the main sitting flow.
- Avoid adding heavy game logic before applications and contracts work end to end.
- Keep rewards cosmetic unless there is a clear trust/safety review.

### Photo-Based Plant Help

AI vision could eventually help with plant identification or health triage.

Possible uses:

- Suggest a likely plant species from a photo.
- Flag visible issues such as yellowing leaves or dry soil.
- Help owners complete missing plant profile fields.

Risks:

- Image-based plant diagnosis can be wrong.
- Uploads introduce storage, privacy, and moderation concerns.
- This requires stronger consent and clearer disclaimers.

## AI Features To Avoid Early

Avoid these until the product is mature:

- Fully automated sitter approval or rejection.
- AI deciding payments, refunds, disputes, or contract outcomes.
- AI-generated reviews.
- AI conversations that hide or replace real user consent.
- AI features that require storing sensitive personal information without a clear reason.

## Technical Architecture

Do not call an AI provider directly from the Expo frontend with a private API key.

Recommended architecture:

```text
Expo app
  |
  v
Supabase Edge Function or small backend endpoint
  |
  v
AI provider API
  |
  v
Supabase database, if storing approved outputs
```

The server-side function should:

- Verify the authenticated user.
- Check that the user is allowed to access the plant, listing, application, or profile.
- Validate and limit input size.
- Rate-limit requests.
- Keep private API keys out of the frontend.
- Store only outputs the user approves, unless logs are truly needed.

## Privacy And Safety Rules

- Do not send Supabase service role keys, database passwords, or private secrets to an AI API.
- Avoid sending phone numbers, addresses, emergency contacts, payment details, or private messages unless the feature truly requires it.
- Give users control before publishing AI-generated text.
- Keep an audit trail for important generated content if it affects listings, applications, or contracts.
- Add abuse monitoring before AI chat or messaging features.
- Make it easy to delete AI-generated drafts and profile text.

## Suggested AI Roadmap

### Phase A - No AI Dependency

Finish the basic sitting flow:

- Plant profiles.
- Sitting requests.
- Sitter applications.
- Owner inbox.
- Accept/decline.
- Contracts.

### Phase B - Low-Risk AI Helpers

Add optional drafting tools:

- Plant bio helper.
- Care instruction cleaner.
- Listing description helper.
- Application message helper.

### Phase C - Matching And Search

Add intelligence after there is enough user/listing data:

- Match explanations.
- Semantic search.
- Better sitter recommendations.

### Phase D - Playful And Advanced Features

Add product personality after the utility layer works:

- Plant personalities.
- Plant chat.
- AI mini games.
- Photo-based plant help.

## Recommended First AI Feature

The best first AI feature is a plant profile and care-instruction assistant.

It is useful, demo-friendly, and low risk. It also improves the quality of the plant data that future matching and search features would depend on.
