export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum VerificationDevice {
  CURRENT_DEVICE = 'CURRENT_DEVICE',
  MOBILE_HANDOFF = 'MOBILE_HANDOFF',
}

export enum DocumentType {
  AADHAAR_XML = 'AADHAAR_XML',
  EPAN_PDF = 'EPAN_PDF',
  DIGILOCKER_DL = 'DIGILOCKER_DL',
  PASSPORT = 'PASSPORT',
}

export enum ReviewDecision {
  AUTO_APPROVED = 'AUTO_APPROVED',
  AUTO_REJECTED = 'AUTO_REJECTED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
  MANUAL_APPROVED = 'MANUAL_APPROVED',
  MANUAL_REJECTED = 'MANUAL_REJECTED',
}

export enum IntersexOption {
  YES = 'YES',
  NO = 'NO',
}

export enum DisabilityOption {
  YES = 'YES',
  NO = 'NO',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum SmokingHabit {
  NO = 'NO',
  YES = 'YES',
  OCCASIONALLY = 'OCCASIONALLY',
}

export enum DrinkingHabit {
  NO = 'NO',
  YES = 'YES',
  OCCASIONALLY = 'OCCASIONALLY',
  SOCIALLY = 'SOCIALLY',
}

export enum DietType {
  VEGETARIAN = 'VEGETARIAN',
  NON_VEGETARIAN = 'NON_VEGETARIAN',
  VEGAN = 'VEGAN',
  PESCATARIAN = 'PESCATARIAN',
  EGGETARIAN = 'EGGETARIAN',
  HALAL = 'HALAL',
  KETO = 'KETO',
  OTHER = 'OTHER',
}

export enum RelationshipGoal {
  LONG_TERM_RELATIONSHIP = 'LONG_TERM_RELATIONSHIP',
  MARRIAGE = 'MARRIAGE',
  CASUAL_DATING = 'CASUAL_DATING',
  FRIENDSHIP = 'FRIENDSHIP',
  OPEN_TO_OPTIONS = 'OPEN_TO_OPTIONS',
}

export enum RelationshipStatus {
  SINGLE = 'SINGLE',
  COMPLICATED = 'COMPLICATED',
  SEPARATED = 'SEPARATED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum MaritalStatus {
  NEVER_MARRIED = 'NEVER_MARRIED',
  DIVORCED = 'DIVORCED',
  SEPARATED = 'SEPARATED',
  WIDOWED = 'WIDOWED',
}

export enum HealthConditionPreference {
  NO_PREFERENCE = 'no_preference',
  OPEN_TO_IT = 'open_to_it',
  PREFER_PARTNER_WITHOUT = 'prefer_partner_without',
  PREFER_NOT_TO_SPECIFY = 'prefer_not_to_specify',
}