import { create } from 'domain'
import { createClient } from './supabase/client'
import { Offer } from './types'

// Get all offers with company information
export async function getOffers(): Promise<Offer[]> {
  const supabase = createClient()
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
  const supabase = createClient()
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

export async function getOffersFiltered({title, location, sector}: {title?: string, location?: string, sector?: string}): Promise<Offer[]> {
  const supabase = createClient();

  let query = supabase.from('offers')
    .select(`*,
      company:companies(*)
    `);

  if (title && title.trim()) {
    query = query.ilike('title', `%${title}%`);
  }

  if (location && location.trim()) {
    query = query.ilike('location', `%${location}%`);
  }

  if (sector && sector !== 'all') {
    query = query.eq('sector', sector);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching filtered offers:', error);
    throw error;
  }

  return data || [];
}

// Get unique sectors from all offers
export async function getUniqueSectors(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('offers')
    .select('sector')
    .order('sector', { ascending: true });

  if (error) {
    console.error('Error fetching sectors:', error);
    throw error;
  }

  // Extract unique sectors from the data
  const uniqueSectors = [...new Set(data?.map(offer => offer.sector) || [])];

  return uniqueSectors;
}

export async function getOffersByCompany(companyId: string): Promise<Offer[] | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('company_id', companyId)

  if(error) {
    console.error('Error fetching offers : ', error)
    return null
  }
  return data || null
}