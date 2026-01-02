import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'INVALID_BODY', detail: 'Request body is not valid JSON' },
        { status: 400 }
      );
    }
    
    const provider = body.provider || 'google-gmail';
    
    // Get backend URL - in production, backend should be on same domain or configured via env
    // For DigitalOcean, if backend is separate service, use env var
    // Otherwise, try to use the rewrite destination
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
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

