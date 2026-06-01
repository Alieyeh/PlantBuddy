const CARE_PROFILE_FORM_FIELDS = Object.freeze([
  'wateringFrequency',
  'wateringFrequencyUnit',
  'lightRequirements',
  'humidityRequirements',
  'locationNotes',
  'specialInstructions',
]);

function normalizeCareSearchText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getProfileSearchText(profile) {
  return [
    profile?.common_name,
    profile?.scientific_name,
    ...(Array.isArray(profile?.aliases) ? profile.aliases : []),
  ]
    .map(normalizeCareSearchText)
    .filter(Boolean)
    .join(' ');
}

function scorePlantCareProfile(profile, speciesQuery, ageDescription) {
  const query = normalizeCareSearchText(speciesQuery);
  if (!query || !profile?.is_active) return 0;

  const profileAge = profile.age_description ?? null;
  if (profileAge && profileAge !== ageDescription) return 0;

  const names = [
    profile.common_name,
    profile.scientific_name,
    ...(Array.isArray(profile.aliases) ? profile.aliases : []),
  ].map(normalizeCareSearchText).filter(Boolean);

  const searchable = getProfileSearchText(profile);
  let score = 0;

  if (names.some((name) => name === query)) {
    score = 100;
  } else if (names.some((name) => name.includes(query) || query.includes(name))) {
    score = 80;
  } else {
    const queryTerms = query.split(' ').filter(Boolean);
    score = queryTerms.every((term) => searchable.includes(term)) ? 60 : 0;
  }

  if (!score) return 0;
  return score + (profileAge ? 20 : 5);
}

function findBestPlantCareProfile(profiles, speciesQuery, ageDescription = null) {
  return [...(profiles ?? [])]
    .map((profile) => ({
      profile,
      score: scorePlantCareProfile(profile, speciesQuery, ageDescription),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.profile.sort_order ?? 0) - (b.profile.sort_order ?? 0))[0]?.profile ?? null;
}

function isBlankFormValue(value) {
  return String(value ?? '').trim().length === 0;
}

function hasExistingCareValues(form) {
  return CARE_PROFILE_FORM_FIELDS.some((field) => {
    if (field === 'wateringFrequencyUnit') return false;
    return !isBlankFormValue(form?.[field]);
  });
}

function buildCareProfilePatch(profile, form = {}, overwrite = false) {
  if (!profile) return {};

  const patch = {
    wateringFrequency: profile.watering_frequency_days ? String(profile.watering_frequency_days) : '',
    wateringFrequencyUnit: profile.watering_frequency_unit || 'days',
    lightRequirements: profile.light_requirements || '',
    humidityRequirements: profile.humidity_requirements || '',
    locationNotes: profile.location_notes || '',
    specialInstructions: profile.care_notes || '',
  };

  return Object.fromEntries(
    Object.entries(patch).filter(([field, value]) => {
      if (!value) return false;
      if (overwrite) return true;
      return field === 'wateringFrequencyUnit' || isBlankFormValue(form[field]);
    })
  );
}

module.exports = {
  buildCareProfilePatch,
  findBestPlantCareProfile,
  hasExistingCareValues,
  normalizeCareSearchText,
  scorePlantCareProfile,
};
