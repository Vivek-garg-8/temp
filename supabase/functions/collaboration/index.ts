import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CollaborationEvent {
  type: 'cursor_update' | 'content_update' | 'user_join' | 'user_leave';
  snippetId: string;
  userId: string;
  data?: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'POST':
        if (path === 'join') {
          return await handleJoinSession(req, supabase, user.id);
        } else if (path === 'update') {
          return await handleUpdateSession(req, supabase, user.id);
        }
        break;
      
      case 'DELETE':
        if (path === 'leave') {
          return await handleLeaveSession(req, supabase, user.id);
        }
        break;
      
      case 'GET':
        if (path === 'sessions') {
          return await handleGetSessions(req, supabase, user.id);
        }
        break;
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleJoinSession(req: Request, supabase: any, userId: string) {
  const { snippetId } = await req.json();

  // Check if user can access this snippet
  const { data: snippet, error: snippetError } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', snippetId)
    .single();

  if (snippetError || !snippet) {
    throw new Error('Snippet not found');
  }

  if (!snippet.is_public && snippet.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Create or update collaboration session
  const { data, error } = await supabase
    .from('collaboration_sessions')
    .upsert({
      snippet_id: snippetId,
      user_id: userId,
      last_active: new Date().toISOString(),
    })
    .select('*, user:profiles(*)')
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ session: data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleUpdateSession(req: Request, supabase: any, userId: string) {
  const { snippetId, cursorPosition } = await req.json();

  const { error } = await supabase
    .from('collaboration_sessions')
    .update({
      cursor_position: cursorPosition,
      last_active: new Date().toISOString(),
    })
    .eq('snippet_id', snippetId)
    .eq('user_id', userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleLeaveSession(req: Request, supabase: any, userId: string) {
  const { snippetId } = await req.json();

  const { error } = await supabase
    .from('collaboration_sessions')
    .delete()
    .eq('snippet_id', snippetId)
    .eq('user_id', userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleGetSessions(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url);
  const snippetId = url.searchParams.get('snippetId');

  if (!snippetId) {
    throw new Error('Snippet ID required');
  }

  // Get active sessions for this snippet
  const { data, error } = await supabase
    .from('collaboration_sessions')
    .select('*, user:profiles(*)')
    .eq('snippet_id', snippetId)
    .gte('last_active', new Date(Date.now() - 30000).toISOString()) // Active in last 30 seconds
    .order('last_active', { ascending: false });

  if (error) throw error;

  return new Response(
    JSON.stringify({ sessions: data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}