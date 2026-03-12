import { createClient } from "./supabase/client";
import { Skill } from "./types";

// Get all available skills
export async function getAllSkills(): Promise<Skill[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching skills:', error)
        return []
    }
    return data || []
}

export async function getSkillById(skillId: number): Promise<Skill | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single()

    if (error) {
        console.error('Error fetching skill:', error)
    }
    return data
}

export async function getOfferSkills(offerId: string): Promise<Skill[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('offer_skills')
        .select('skill_id, skills (id, name)')
        .eq('offer_id', offerId)

    if (error) {
        console.error('Error fetching offer skills:', error)
        return []
    }
    if (!data) return []

    // data looks like this: 
    // [
    //   { "skill_id": 1, "skills": { "id": 1, "name": "React" } },
    //   { "skill_id": 2, "skills": { "id": 2, "name": "Node.js" } }
    // ]
    // pull out the nested skills object
    const skillsList = data.map((item: any) => {
        return item.skills as Skill
    })

    return skillsList
}

export async function addOfferSkill(offerId: string, skillIds: number[]) {
    const supabase = createClient()

    // Build one row per skill: [{ offer_id: "abc", skill_id: 1 }, { offer_id: "abc", skill_id: 2 }, ...]
    const rows = skillIds.map(skillId => ({ offer_id: offerId, skill_id: skillId }))

    const { error } = await supabase
        .from('offer_skills')
        .insert(rows)

    if (error) {
        // Ignore duplicate key errors (already has skill)
        if (error.code === '23505') return true
        throw error
    }
    return true
}

export async function editOfferSkill(offerId: string, skillIds: number[]) {
    const supabase = createClient()

    // Step 1: delete all old skills for this offer
    const { error: deleteError } = await supabase
        .from('offer_skills')
        .delete()
        .eq('offer_id', offerId)

    if (deleteError) {
        console.error('Error deleting old skills:', deleteError)
        throw deleteError
    }

    // Step 2: if there are new skills to add, insert them
    if (skillIds.length > 0) {
        const rows = skillIds.map(skillId => ({ offer_id: offerId, skill_id: skillId }))

        const { error: insertError } = await supabase
            .from('offer_skills')
            .insert(rows)

        if (insertError) {
            console.error('Error inserting new skills:', insertError)
            throw insertError
        }
    }

    return true
}

export async function removeOfferSkill(offerId: string, skillId: number) {
    const supabase = createClient()

    const { error } = await supabase
        .from('offer_skills')
        .delete()
        .eq('offer_id', offerId)
        .eq('skill_id', skillId)

    if (error) {
        throw error
    }
    return true
}
// ---------------- Student skills
// Get student's skills
export async function getStudentSkills(userId: string): Promise<Skill[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('student_skills')
        .select(`skill_id, skills (id, name)`)
        .eq('student_id', userId)

    if (error) {
        console.error('Error fetching student skills:', error)
        return []
    }

    // If Supabase returned nothing, return an empty list instead of crashing
    if (!data) {
        return []
    }

    // Each item in "data" looks like this (because of the join in the query above):
    //   { skill_id: 1, skills: { id: 1, name: "JavaScript" } }
    //
    // We only want the inner "skills" object, not the wrapper.
    // So we loop through every item and pull out just the skills part.
    // Note: we use "any" for item here because Supabase can't automatically tell
    // that the "skills" join returns one object (not an array). TypeScript would
    // complain about the type otherwise, but at runtime it works correctly.
    const skillsList = data.map((item: any) => {
        return item.skills as Skill
    })

    return skillsList
}

// Add a skill to student
export async function addStudentSkill(userId: string, skillId: number) {
    const supabase = createClient()

    const { error } = await supabase
        .from('student_skills')
        .insert({ student_id: userId, skill_id: skillId })

    if (error) {
        // Ignore duplicate key errors (already has skill)
        if (error.code === '23505') return true
        throw error
    }
    return true
}

// Remove a skill from student
export async function removeStudentSkill(userId: string, skillId: number) {
    const supabase = createClient()

    const { error } = await supabase
        .from('student_skills')
        .delete()
        .eq('student_id', userId)
        .eq('skill_id', skillId)

    if (error) {
        throw error
    }
    return true
}
