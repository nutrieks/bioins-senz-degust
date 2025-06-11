
import { supabase } from '@/integrations/supabase/client';

export async function getUsers(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function updateUserPassword(userId: string, password: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ password })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Error updating user password:', error);
    return false;
  }
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
}
