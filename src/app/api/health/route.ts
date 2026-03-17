import { cookies } from 'next/headers';
import { createServerComponentClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient(cookieStore);

    // Ping Supabase with a simple query
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return Response.json(
        {
          status: 'degraded',
          timestamp,
          supabase: 'error',
          error: error.message,
        },
        { status: 503 }
      );
    }

    return Response.json(
      {
        status: 'ok',
        timestamp,
        supabase: 'connected',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        timestamp,
        supabase: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
