
import { supabase } from '@/integrations/supabase/client'
import { User, UserRole } from '@/types'

export interface SyncResult {
  success: boolean;
  message: string;
  syncedUsers: number;
  errors: string[];
}

export async function syncUsersWithAuth(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    message: '',
    syncedUsers: 0,
    errors: []
  };

  try {
    // Get all users from the users table
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*');

    if (fetchError) {
      result.errors.push(`Failed to fetch users: ${fetchError.message}`);
      return result;
    }

    console.log('Found users to sync:', existingUsers?.length || 0);

    for (const user of existingUsers || []) {
      try {
        // Generate email based on user type
        let email: string;
        if (user.role === UserRole.ADMIN) {
          email = "admin@bioins.local";
        } else {
          email = `evaluator${user.evaluator_position}@bioins.local`;
        }

        console.log(`Syncing user: ${user.username} (${email})`);

        // Try to create user in Supabase Auth with the same ID
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          id: user.id, // Use the same ID from our users table
          email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            role: user.role,
            evaluator_position: user.evaluator_position
          }
        });

        if (authError) {
          // If user already exists in auth, that's fine
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            console.log(`User ${user.username} already exists in auth - skipping`);
          } else {
            result.errors.push(`Failed to create auth user ${user.username}: ${authError.message}`);
            console.error(`Auth error for ${user.username}:`, authError);
          }
        } else {
          console.log(`Successfully synced user: ${user.username}`);
          result.syncedUsers++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Error syncing user ${user.username}: ${errorMessage}`);
        console.error(`Error syncing user ${user.username}:`, error);
      }
    }

    result.success = result.errors.length === 0 || result.syncedUsers > 0;
    result.message = result.success 
      ? `Successfully synced ${result.syncedUsers} users with Supabase Auth`
      : 'Failed to sync users with Supabase Auth';

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Sync operation failed: ${errorMessage}`);
    console.error('Sync operation failed:', error);
    return result;
  }
}
