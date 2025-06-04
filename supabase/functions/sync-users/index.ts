
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting user sync process...');

    // Get all users from the users table
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*');

    if (fetchError) {
      console.error('Failed to fetch users:', fetchError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch users: ${fetchError.message}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${existingUsers?.length || 0} users to sync`);

    const results = {
      success: 0,
      errors: [] as string[],
      total: existingUsers?.length || 0
    };

    for (const user of existingUsers || []) {
      try {
        // Generate email based on user type
        let email: string;
        if (user.role === 'ADMIN') {
          email = "admin@bioins.local";
        } else {
          email = `evaluator${user.evaluator_position}@bioins.local`;
        }

        console.log(`Syncing user: ${user.username} (${email})`);

        // Try to create user in Supabase Auth with the same ID
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
            results.errors.push(`Failed to create auth user ${user.username}: ${authError.message}`);
            console.error(`Auth error for ${user.username}:`, authError);
          }
        } else {
          console.log(`Successfully synced user: ${user.username}`);
          results.success++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Error syncing user ${user.username}: ${errorMessage}`);
        console.error(`Error syncing user ${user.username}:`, error);
      }
    }

    const responseData = {
      message: `Sync completed. Successfully synced ${results.success} out of ${results.total} users.`,
      syncedUsers: results.success,
      totalUsers: results.total,
      errors: results.errors,
      success: results.errors.length === 0 || results.success > 0
    };

    console.log('Sync results:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Sync operation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: `Sync operation failed: ${errorMessage}`,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
