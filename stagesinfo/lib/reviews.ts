import { createClient } from './supabase/client';
import { Review } from './types';

// Submit a company review for an accepted student application
export async function submitReview(
    applicationId: string,
    rating: number,
    comment: string
): Promise<boolean> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reviews')
        .insert({
            application_id: applicationId,
            rating,
            comment,
            evaluator: 'company',
            evaluated_at: new Date().toISOString(),
        })
        .select();

    if (error || !data || data.length === 0) {
        console.error('Error submitting review:', error);
        return false;
    }
    return true;
}

// Get the existing review for one application (null if none yet)
export async function getReviewForApplication(applicationId: string): Promise<Review | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching review:', error);
        return null;
    }
    return data;
}
