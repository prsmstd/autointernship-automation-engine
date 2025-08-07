import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, withAdminAuth, SecureQuery, validateInput } from '@/lib/api-middleware';
import { InputValidator, AuditLogger } from '@/lib/security';

// GET - Fetch announcements (requires authentication)
export const GET = withAuth(async (request: NextRequest, context: any) => {
  const { user } = context;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || user.id;

  // Validate UUID
  if (userId && !SecureQuery.validateUUID(userId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid user ID format' },
      { status: 400 }
    );
  }

  return await SecureQuery.execute(async () => {
    // Get all active announcements with admin names
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select(`
        *,
        users!announcements_created_by_fkey(full_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (announcementsError) {
      throw announcementsError;
    }

    // Get read status for current user only
    let readAnnouncements = [];
    if (userId === user.id) { // Only allow users to see their own read status
      const { data: readData, error: readError } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', userId);

      if (readError) {
        await AuditLogger.log('announcement_read_error', user.id, { error: readError.message }, request);
      } else {
        readAnnouncements = readData || [];
      }
    }

    // Transform data to include admin_name and read status
    const transformedAnnouncements = announcements?.map((announcement: any) => ({
      id: announcement.id,
      title: InputValidator.sanitizeString(announcement.title),
      content: InputValidator.sanitizeString(announcement.content),
      priority: announcement.priority,
      created_at: announcement.created_at,
      admin_name: InputValidator.sanitizeString(announcement.users?.full_name || 'Admin'),
      is_read: readAnnouncements.some((r: any) => r.announcement_id === announcement.id)
    })) || [];

    await AuditLogger.log('announcements_fetched', user.id, { count: transformedAnnouncements.length }, request);

    return NextResponse.json({
      success: true,
      data: transformedAnnouncements
    });
  }, user.id, 'fetch_announcements');
});

// POST - Create announcement (requires admin authentication)
export const POST = withAdminAuth(async (request: NextRequest, context: any) => {
  const { user } = context;
  
  try {
    const body = await request.json();
    const { title, content, priority } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Validate input lengths and content
    const titleValidation = InputValidator.sanitizeString(title);
    const contentValidation = InputValidator.sanitizeString(content);

    if (titleValidation.length < 3 || titleValidation.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title must be between 3 and 200 characters' },
        { status: 400 }
      );
    }

    if (contentValidation.length < 10 || contentValidation.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Content must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    const sanitizedPriority = priority && validPriorities.includes(priority) ? priority : 'medium';

    return await SecureQuery.execute(async () => {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: titleValidation,
          content: contentValidation,
          priority: sanitizedPriority,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await AuditLogger.log('announcement_created', user.id, { 
        announcementId: data.id,
        title: titleValidation,
        priority: sanitizedPriority
      }, request);

      return NextResponse.json({
        success: true,
        data: {
          id: data.id,
          title: data.title,
          content: data.content,
          priority: data.priority,
          created_at: data.created_at
        }
      });
    }, user.id, 'create_announcement');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await AuditLogger.log('announcement_creation_error', user.id, { error: errorMessage }, request);
    return NextResponse.json(
      { success: false, error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
});