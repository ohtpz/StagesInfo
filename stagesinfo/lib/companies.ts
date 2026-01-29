import { createClient } from './supabase/client'
import { Company, CompanyInput } from './types'

// Get all companies
export async function getCompanies(): Promise<Company[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', error)
    throw error
  }

  return data || []
}

// Get a single company by ID
export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching company:', error)
    return null
  }

  return data
}

// Get companies by sector
export async function getCompaniesBySector(sector: string): Promise<Company[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('sector', sector)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching companies by sector:', error)
    throw error
  }

  return data || []
}

// Get companies by the owner user ID
export async function getCompaniesByOwner(ownerUserId: string): Promise<Company[] | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_user_id', ownerUserId)

  if (error) {
    console.error('Error fetching company by owner:', error)
    return null
  }
  return data || []
}

export async function createCompany(company: CompanyInput ): Promise<Company | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()  // ← This tells Supabase to return the inserted row
    .single()

  if (error) {
    console.error('Error creating company:', error)
    return null
  }

  return data
}