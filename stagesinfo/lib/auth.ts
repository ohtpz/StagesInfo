import { createClient } from "./supabase/client";

// Sign in à la base de donnée
export const connexion = async (email: string, password: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Dispatch custom event to notify navbar
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-state-changed'));
  }

  return data.user;
};

// Sign up à la base de donnée
export const inscription = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'student' | 'company',
  companyData?: { name: string; sector: string; address: string }
) => {
  const supabase = createClient();

  // Create the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("User creation failed");
  }

  // Wait briefly for auth context to be established
  await new Promise(resolve => setTimeout(resolve, 100));

  // Create profile using upsert (handles both new and existing)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.error("Profile creation error:", profileError);
    throw new Error(`Profile creation failed: ${profileError.message}`);
  }

  // If student, create student record
  if (role === 'student') {
    const { error: studentError } = await supabase
      .from('students')
      .upsert(
        {
          user_id: data.user.id,
          cv_path: null,
        },
        { onConflict: 'user_id' }
      );

    if (studentError) {
      console.error("Student creation error:", studentError);
      throw new Error(`Student creation failed: ${studentError.message}`);
    }
  }

  // If company, create company record
  if (role === 'company' && companyData) {
    const { error: companyError } = await supabase
      .from('companies')
      .insert({
        owner_id: data.user.id,
        name: companyData.name,
        sector: companyData.sector,
        address: companyData.address,
      });

    if (companyError) {
      console.error("Company creation error:", companyError);
      throw new Error(`Company creation failed: ${companyError.message}`);
    }
  }

  return data.user;
};

export const deconnexion = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  // Dispatch custom event to notify navbar
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-state-changed'));
  }
};

export const getCurrentUser = async () => {
  const supabase = createClient();

  // First, get the authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null; // Return null when no user is logged in
  }

  // Then, get the full profile from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  return profile;
};