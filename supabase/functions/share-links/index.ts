import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean).pop();

    // Handle public access via share token
    if (req.method === 'GET' && path && path.length === 32) {
      return await handlePublicAccess(path, supabase);
    }

    // All other routes require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    switch (req.method) {
      case 'POST':
        return await handleCreateShareLink(req, supabase, user.id);
      
      case 'GET':
        return await handleGetShareLinks(supabase, user.id);
      
      case 'DELETE':
        return await handleDeleteShareLink(req, supabase, user.id);
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

async function handleCreateShareLink(req: Request, supabase: any, userId: string) {
  const body = await req.json();
  const { snippetId, collectionId, expiresIn, maxViews } = body;

  if (!snippetId && !collectionId) {
    throw new Error('Either snippetId or collectionId is required');
  }

  // Verify ownership
  if (snippetId) {
    const { data: snippet, error } = await supabase
      .from('snippets')
      .select('user_id')
      .eq('id', snippetId)
      .single();

    if (error || snippet.user_id !== userId) {
      throw new Error('Snippet not found or access denied');
    }
  }

  if (collectionId) {
    const { data: collection, error } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .single();

    if (error || collection.user_id !== userId) {
      throw new Error('Collection not found or access denied');
    }
  }

  // Generate share link
  const token = generateShareToken();
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

  const { data, error } = await supabase
    .from('share_links')
    .insert({
      snippet_id: snippetId || null,
      collection_id: collectionId || null,
      token,
      expires_at: expiresAt,
      max_views: maxViews || null,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      shareLink: data,
      url: `${new URL(req.url).origin}/share/${token}`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleGetShareLinks(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('share_links')
    .select(`
      *,
      snippet:snippets(id, title),
      collection:collections(id, name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return new Response(
    JSON.stringify({ shareLinks: data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleDeleteShareLink(req: Request, supabase: any, userId: string) {
  const { linkId } = await req.json();

  const { error } = await supabase
    .from('share_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handlePublicAccess(token: string, supabase: any) {
  // Get share link
  const { data: shareLink, error } = await supabase
    .from('share_links')
    .select(`
      *,
      snippet:snippets(*),
      collection:collections(*, snippets(*))
    `)
    .eq('token', token)
    .single();

  if (error || !shareLink) {
    return new Response(
      JSON.stringify({ error: 'Share link not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Check if expired
  if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ error: 'Share link has expired' }),
      {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Check view limit
  if (shareLink.max_views && shareLink.current_views >= shareLink.max_views) {
    return new Response(
      JSON.stringify({ error: 'Share link view limit reached' }),
      {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Increment view count
  await supabase
    .from('share_links')
    .update({ current_views: shareLink.current_views + 1 })
    .eq('id', shareLink.id);

  return new Response(
    JSON.stringify({ 
      content: shareLink.snippet || shareLink.collection,
      type: shareLink.snippet_id ? 'snippet' : 'collection'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}