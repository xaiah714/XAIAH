import { DemographicTag, IncomeBracket, SchoolYear, AwardType } from "@prisma/client";

export type TagGroup = {
  label: string;
  tags: { value: DemographicTag; label: string }[];
};

// Grouped for form rendering; values must match the DemographicTag enum in
// prisma/schema.prisma exactly.
export const DEMOGRAPHIC_TAG_GROUPS: TagGroup[] = [
  {
    label: "Ethnicity & heritage",
    tags: [
      { value: "HISPANIC_LATINO", label: "Hispanic / Latino" },
      { value: "BLACK_AFRICAN_AMERICAN", label: "Black / African American" },
      { value: "ASIAN_AMERICAN_PACIFIC_ISLANDER", label: "Asian American / Pacific Islander" },
      { value: "NATIVE_AMERICAN_INDIGENOUS", label: "Native American / Indigenous" },
      { value: "MIDDLE_EASTERN_ARAB_AMERICAN", label: "Middle Eastern / Arab American" },
    ],
  },
  {
    label: "Gender & identity",
    tags: [
      { value: "WOMEN_IN_STEM", label: "Women in STEM" },
      { value: "WOMEN_IN_TRADES_BUSINESS", label: "Women in trades / business" },
      { value: "LGBTQ", label: "LGBTQ+" },
      { value: "TRANSGENDER", label: "Transgender specific" },
    ],
  },
  {
    label: "Family & life circumstance",
    tags: [
      { value: "SINGLE_PARENT", label: "Single parent" },
      { value: "FIRST_GENERATION", label: "First generation student" },
      { value: "STUDENT_WITH_CHILDREN", label: "Student with children" },
      { value: "FOSTER_CARE_ALUMNI", label: "Foster care alumni" },
      { value: "VETERAN_OR_MILITARY_DEPENDENT", label: "Veteran / military dependent" },
      { value: "INCARCERATED_PARENT", label: "Student with incarcerated parent(s)" },
    ],
  },
  {
    label: "Disability & health",
    tags: [
      { value: "PHYSICAL_DISABILITY", label: "Physical disability" },
      { value: "LEARNING_DISABILITY_ADHD", label: "Learning disability (LD/ADHD)" },
      { value: "CHRONIC_ILLNESS", label: "Chronic illness" },
      { value: "MENTAL_HEALTH_ADVOCACY", label: "Mental health advocacy" },
    ],
  },
  {
    label: "Academic & career path",
    tags: [
      { value: "STEM", label: "STEM" },
      { value: "HEALTHCARE_NURSING", label: "Healthcare / nursing" },
      { value: "EDUCATION", label: "Education" },
      { value: "TRADES_VOCATIONAL", label: "Trades / vocational" },
      { value: "FIRST_RESPONDER", label: "First responders" },
      { value: "AGRICULTURE", label: "Agriculture" },
    ],
  },
  {
    label: "Socioeconomic",
    tags: [
      { value: "LOW_INCOME_PELL_ELIGIBLE", label: "Low income / Pell eligible" },
      { value: "RURAL", label: "Rural student" },
      { value: "HOUSING_INSECURE", label: "Housing insecure" },
    ],
  },
  {
    label: "Religious & cultural affiliation",
    tags: [
      { value: "CATHOLIC", label: "Catholic" },
      { value: "JEWISH", label: "Jewish" },
      { value: "MUSLIM", label: "Muslim" },
      { value: "OTHER_RELIGIOUS", label: "Other denominational fund" },
    ],
  },
];

export const DEMOGRAPHIC_TAG_LABELS: Record<DemographicTag, string> =
  DEMOGRAPHIC_TAG_GROUPS.reduce((acc, group) => {
    for (const tag of group.tags) acc[tag.value] = tag.label;
    return acc;
  }, {} as Record<DemographicTag, string>);

export const INCOME_BRACKET_LABELS: Record<IncomeBracket, string> = {
  UNDER_30K: "Under $30,000",
  FROM_30K_TO_60K: "$30,000 - $60,000",
  FROM_60K_TO_100K: "$60,000 - $100,000",
  OVER_100K: "Over $100,000",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export const SCHOOL_YEAR_LABELS: Record<SchoolYear, string> = {
  HIGH_SCHOOL_SENIOR: "High school senior (college-bound)",
  FRESHMAN: "Freshman",
  SOPHOMORE: "Sophomore",
  JUNIOR: "Junior",
  SENIOR: "Senior",
  GRADUATE: "Graduate student",
  OTHER: "Other / returning student",
};

export const AWARD_TYPE_LABELS: Record<AwardType, string> = {
  SCHOLARSHIP: "Scholarship",
  GRANT: "Grant",
  FELLOWSHIP: "Fellowship",
};

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
];
