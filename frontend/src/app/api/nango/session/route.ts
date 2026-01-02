import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Log that the route was hit
  console.log('[API Route] /api/nango/session POST received');
  
  try {
    // Check if body exists
    const bodyText = await request.text();
    console.log('[API Route] Raw body:', bodyText);
    
    // Parse request body
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown parse error';
      console.error('[API Route] JSON parse error:', e);
      return NextResponse.json(
        { error: 'INVALID_BODY', detail: `Request body is not valid JSON: ${errorMessage}`, rawBody: bodyText.substring(0, 100) },
        { status: 400 }
      );
    }
    
    const provider = body.provider || 'google-gmail';
    console.log('[API Route] Provider:', provider);
    
    // Get backend URL - in production, backend should be configured via env
    // For DigitalOcean App Platform, if backend is on same app, use internal service URL
    // If separate, use full public URL
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_URL || 
                      'http://127.0.0.1:8000';
    
    console.log('[API Route] Backend URL:', backendUrl);
    console.log('[API Route] Forwarding to:', `${backendUrl}/nango/session`);
    
    // Make request to backend
    const response = await fetch(`${backendUrl}/nango/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ provider }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: 'BACKEND_ERROR', detail: errorData, statusCode: response.status },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] Nango session error:', error);
    return NextResponse.json(
      { error: 'PROXY_ERROR', detail: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

