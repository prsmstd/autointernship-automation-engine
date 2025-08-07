import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { announcement_id, user_id } = body;

    if (!announcement_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already marked as read
    const { data: existing, error: checkError } = await supabase
      .from('announcement_reads')
      .select('id')
      .eq('announcement_id', announcement_id)
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // If not already read, mark as read
    if (!existing) {
      const { data, error } = await supabase
        .from('announcement_reads')
        .insert({
          announcement_id,
          user_id,
          read_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        data
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Already marked as read'
    });

  } catch (error) {
    console.error('Error marking announcement as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark announcement as read' },
      { status: 500 }
    );
  }
}