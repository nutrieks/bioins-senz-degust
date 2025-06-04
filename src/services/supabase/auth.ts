
import { supabase } from '@/integrations/supabase/client'
import { User, UserRole } from '@/types'

// Authentication
export async function loginWithSupabase(identifier: string, password: string): Promise<User | null> {
  try {
    // Convert identifier to email format for Supabase Auth
    let email = identifier;
    if (identifier === "ADMIN") {
      email = "admin@bioins.local";
    } else if (/^([1-9]|1[0-2])$/.test(identifier)) {
      email = `evaluator${identifier}@bioins.local`;
    } else {
      console.log('Invalid identifier format');
      return null;
    }

    console.log('Attempting Supabase Auth login with email:', email);
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.log('Supabase Auth error:', authError);
      return null;
    }

    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      console.log('User not found in users table:', userError);
      // Sign out if user data not found
      await supabase.auth.signOut();
      return null;
    }

    // Convert database user to app user
    const user: User = {
      id: userData.id,
      username: userData.username,
      role: userData.role as UserRole,
      evaluatorPosition: userData.evaluator_position || undefined,
      isActive: userData.is_active,
      password: userData.password
    };

    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// User Management
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username')

    if (error) throw error

    return (data || []).map((userData: any) => ({
      id: userData.id,
      username: userData.username,
      role: userData.role as UserRole,
      evaluatorPosition: userData.evaluator_position || undefined,
      isActive: userData.is_active,
      password: userData.password
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function createUser(
  username: string,
  role: string,
  evaluatorPosition?: number
): Promise<User> {
  const password = role === UserRole.ADMIN ? "BioinsADMIN" : `Bioins${evaluatorPosition}`
  
  // Create email for Supabase Auth
  let email = role === UserRole.ADMIN ? "admin@bioins.local" : `evaluator${evaluatorPosition}@bioins.local`;
  
  // First create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError || !authData.user) throw authError;

  // Then create user in our users table with the same ID
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      username,
      role,
      evaluator_position: evaluatorPosition,
      is_active: true,
      password
    })
    .select()
    .single()

  if (error) {
    // Clean up auth user if users table insert fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }

  return {
    id: data.id,
    username: data.username,
    role: data.role as UserRole,
    evaluatorPosition: data.evaluator_position || undefined,
    isActive: data.is_active,
    password: data.password
  }
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Error updating user status:', error)
    return false
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    // Update password in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (authError) {
      console.error('Error updating auth password:', authError);
      return false;
    }

    // Update password in our users table
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Error updating user password:', error)
    return false
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
}
