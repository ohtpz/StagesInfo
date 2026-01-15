import { supabase } from './supabase'
import { Offer } from './types'

// Get all offers with company information
export async function getOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      company:companies(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching offers:', error)
    throw error
  }

  return data || []
}

// Get a single offer by ID with company information
export async function getOfferById(id: string): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching offer:', error)
    return null
  }

  return data
}

// Get offers by sector
export async function getOffersBySector(sector: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('sector', sector)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching offers by sector:', error)
    throw error
  }

  return data || []
}

// Get offers by location
export async function getOffersByLocation(location: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      company:companies(*)
    `)
    .ilike('location', `%${location}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching offers by location:', error)
    throw error
  }

  return data || []
}

// Get offers by company
export async function getOffersByCompany(companyId: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching offers by company:', error)
    throw error
  }

  return data || []
}
