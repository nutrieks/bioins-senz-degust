
import { supabase } from '@/integrations/supabase/client'
import { User, UserRole } from '@/types'

// Authentication
export async function loginWithSupabase(username: string, password: string): Promise<User | null> {
  try {
    // First, get the user from our custom users table
    const { data: userData, error: userError } = await supabase
      .from('users' as any)
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      console.log('User not found or password incorrect')
      return null
    }

    // Convert database user to app user
    const user: User = {
      id: userData.id,
      username: userData.username,
      role: userData.role as UserRole,
      evaluatorPosition: userData.evaluator_position || undefined,
      isActive: userData.is_active,
      password: userData.password
    }

    return user
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

// User Management
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users' as any)
      .select('*')
      .order('username')

    if (error) throw error

    return data.map((userData: any) => ({
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
  
  const { data, error } = await supabase
    .from('users' as any)
    .insert({
      username,
      role,
      evaluator_position: evaluatorPosition,
      is_active: true,
      password
    })
    .select()
    .single()

  if (error) throw error

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
      .from('users' as any)
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
    const { error } = await supabase
      .from('users' as any)
      .update({ password: newPassword })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Error updating user password:', error)
    return false
  }
}
