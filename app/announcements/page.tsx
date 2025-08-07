'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Bell, Calendar, User, Eye, EyeOff } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  created_by: string;
  admin_name: string;
}

interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readAnnouncements, setReadAnnouncements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchAnnouncementsAndReadStatus();
  }, []);

  const fetchAnnouncementsAndReadStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      // Fetch announcements with admin names
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select(`
          *,
          users!announcements_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      // Transform data to include admin_name
      const transformedAnnouncements = announcementsData?.map((announcement: any) => ({
        ...announcement,
        admin_name: announcement.users?.full_name || 'Admin'
      })) || [];

      setAnnouncements(transformedAnnouncements);

      // Fetch read status
      const { data: readData, error: readError } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id);

      if (readError) throw readError;

      const readIds = new Set<string>(readData?.map((r: any) => r.announcement_id as string) || []);
      setReadAnnouncements(readIds);

    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!currentUser || readAnnouncements.has(announcementId)) return;

    try {
      const { error } = await supabase
        .from('announcement_reads')
        .insert({
          announcement_id: announcementId,
          user_id: currentUser.id
        });

      if (error) throw error;

      setReadAnnouncements(prev => new Set([...Array.from(prev), announcementId]));
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center">
                <Bell className="h-6 w-6 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {announcements.length} total announcements
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements</h3>
            <p className="text-gray-500">There are no announcements at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const isRead = readAnnouncements.has(announcement.id);
              return (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${
                    isRead ? 'border-gray-300' : 'border-blue-500'
                  } hover:shadow-md transition-shadow`}
                  onClick={() => markAsRead(announcement.id)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className={`text-lg font-semibold ${
                            isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {announcement.title}
                          </h3>
                          {!isRead && (
                            <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {announcement.admin_name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(announcement.created_at)}
                          </div>
                          <div className="flex items-center">
                            {isRead ? (
                              <Eye className="h-4 w-4 mr-1" />
                            ) : (
                              <EyeOff className="h-4 w-4 mr-1" />
                            )}
                            {isRead ? 'Read' : 'Unread'}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        getPriorityColor(announcement.priority)
                      }`}>
                        {announcement.priority.toUpperCase()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`prose max-w-none ${
                      isRead ? 'text-gray-600' : 'text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap">
                        {announcement.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}