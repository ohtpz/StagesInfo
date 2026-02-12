import { createClient } from './supabase/client'
import { Offer, OfferInput } from './types'


// Get a single offer by ID with company information
export async function getOfferById(id: string): Promise<Offer | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *, 
      company:companies(
        *,
        profile:profiles(*)
      )
    `) // Get all the offers, join with company and get all company, join with profile and get all profile
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching offer:', error)
    return null
  }

  return data
}

export async function getOffersFiltered({
  title,
  location,
  sector,
  page = 1,
  limit = 10
}: {
  title?: string,
  location?: string,
  sector?: string,
  page?: number,
  limit?: number
}): Promise<{ data: Offer[], count: number }> {
  const supabase = createClient();

  // Start building the query
  let query = supabase
    .from('offers')
    .select(`
      *,
      company:companies(*)
    `, { count: 'exact' })
    .eq('status', 'available');  // Only show available offers

  // Apply filters only if they have values
  if (title && title.trim()) {
    query = query.ilike('title', `%${title}%`);
  }

  if (location && location.trim()) {
    query = query.ilike('location', `%${location}%`);
  }

  if (sector && sector !== 'all') {
    query = query.eq('sector', sector);
  }

  // Add pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }

  return { data: data || [], count: count || 0 };
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

  if (error) {
    console.error('Error fetching offers : ', error)
    return null
  }
  return data || null
}

export async function createOffer(offer: OfferInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('offers')
    .insert([offer])
    .select()
    .single()

  if (error) {
    console.error('Error creating offer : ', error)
    return null
  }
  return data || null
}


export async function updateOffer(id: string, offer: OfferInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('offers')
    .update(offer)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating offer : ', error)
    return null
  }
  return data || null
}

export async function deleteOffer(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting offer : ', error)
    return null
  }
  return true
}