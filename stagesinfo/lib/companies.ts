import { supabase } from './supabase'
import { Company } from './types'

// Get all companies
export async function getCompanies(): Promise<Company[]> {
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
