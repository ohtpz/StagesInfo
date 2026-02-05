// Generic utility types for database operations
// Removes auto-generated fields (id, created_at, updated_at) for create operations
export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>

// Offer status enum
export type OfferStatus = 'available' | 'expired' | 'filled';

// Offers table
export interface Offer {
  id: string
  company_id: string
  title: string
  description: string
  duration: string
  start_date: string
  end_date: string
  location: string
  sector: string
  status: OfferStatus
  created_at: string
  updated_at: string
  // Relations
  company?: Company
}

// Companies table
export interface Company {
  id: string
  owner_id: string
  name: string
  address: string
  sector: string
  created_at: string
  updated_at: string

  // Relations
  offers?: Offer[]
  profile?: Profile
}

// Type for creating a new Model (without auto-generated fields)
export type CompanyInput = CreateInput<Company>
export type OfferInput = CreateInput<Offer>
export type ApplicationInput = CreateInput<Application>

// Applications table
export interface Application {
  id: string
  student_id: string
  offer_id: string
  applied_at: string
  status: 'application_status'
  motivation_letter: string
  created_at: string
  updated_at: string
}

// Students table
export interface Student {
  user_id: string
  cv_path: string
  created_at: string
  updated_at: string
}

// Reviews table
export interface Review {
  id: string
  application_id: string
  rating: number
  comment: string
  evaluator: string
  evaluated_at: string
  created_at: string
  updated_at: string
}

// Profiles table
export type UserRole = 'admin' | 'company' | 'student';

export interface Profile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
}

// Skills table
export interface Skill {
  id: number
  name: string
}

// Junction tables
export interface OfferSkill {
  offer_id: string
  skill_id: number
}

export interface StudentSkill {
  student_id: string
  skill_id: number
}
