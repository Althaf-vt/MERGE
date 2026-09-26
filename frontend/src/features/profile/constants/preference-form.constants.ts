export const GENDER_ORIENTATION_OPTIONS = [
    'Women',
    'Men',
    'Non-Binary',
    'Transgender Man',
    'Transgender Woman',
    'Genderfluid',
    'Genderqueer',
    'Agender',
    'Two-Spirit',
    'Bisexual',
    'Lesbian',
    'Gay',
    'Pansexual',
    'Asexual',
    'Queer',
    'Demiguy',
    'Demigirl',
];

export const RELATIONSHIP_INTENT_OPTIONS = [
    { 
        value: 'LONG_TERM_RELATIONSHIP', 
        label: 'Serious Relationship', 
        desc: 'Looking for a long-term partner' 
    },
    { 
        value: 'MARRIAGE', 
        label: 'Marriage', 
        desc: 'Ready to settle down' 
    },
    { 
        value: 'CASUAL_DATING', 
        label: 'Casual Dating', 
        desc: 'Keeping things light' 
    },
    { 
        value: 'FRIENDSHIP', 
        label: 'Friendship', 
        desc: 'Looking to connect and build bonds' 
    },
    { 
        value: 'OPEN_TO_OPTIONS', 
        label: 'Not Sure Yet', 
        desc: 'Seeing where things go' 
    },
];

export const ADOPTION_PREFERENCE_OPTIONS = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
    { value: 'maybe', label: 'Maybe' },
];

export const HEALTH_OPTION_VALUES = [
    { value: 'no_preference', label: 'No Preference' },
    { value: 'open_to_it', label: 'Open to it' },
    { value: 'prefer_partner_without', label: 'Prefer a partner without this' },
    { value: 'prefer_not_to_specify', label: 'Prefer not to specify' },
];

export const HEALTH_CATEGORIES = [
    {
        key: 'diabeteBpPreference',
        title: 'Diabetes & Blood Pressure',
        icon: 'activity',
    },
    {
        key: 'fertilityPreference',
        title: 'Fertility & Reproductive Health',
        icon: 'heart',
    },
    {
        key: 'geneticPreference',
        title: 'Genetic / Hereditary Conditions',
        icon: 'git-commit',
    },
    {
        key: 'infectiousPreference',
        title: 'Infectious Conditions (incl. HIV status)',
        subtext: 'This is a personal comfort setting and never affects your own visibility to others.',
        icon: 'shield',
    },
    {
        key: 'disablilityPreferece',
        title: 'Disability',
        icon: 'user-check',
    },
] as const;