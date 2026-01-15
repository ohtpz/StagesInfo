import { supabase } from "./supabase";

// Sign in à la base de donnée
export const connexion = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
};

// Sign up à la base de donnée
export const inscription = async (  email: string, password: string, firstName: string, lastName: string, role: 'student' | 'company') => {
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

  // Create profile entry
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      ]);

    if (profileError) {
      throw profileError;
    }

    // If student, create student entry
    if (role === 'student') {
      const { error: studentError } = await supabase
        .from('students')
        .insert([
          {
            user_id: data.user.id,
            cv_path: null,
          },
        ]);

      if (studentError) {
        throw studentError;
      }
    }
  }

  return data.user;
};

export const deconnexion = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};