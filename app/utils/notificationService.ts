import { supabase } from '@/lib/supabase';

export interface Notification {
    id: string;
    user_id: string | null;
    title: string;
    message: string;
    type: 'TASK_ASSIGNED' | 'NOTE_UPDATED' | 'ORDER_CREATED' | 'info';
    order_id?: string;
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    /**
     * Fetch unread notifications for a specific user (and broadcasts)
     */
    async getNotifications(userId: string) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                // Try simpler query first to debug. If this works, issue is in OR syntax.
                // .or(`user_id.eq.${userId},user_id.is.null`) 
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching notifications:', error.message);
                return [];
            }

            // Client-side filter to handle complex permission logic safely
            const filtered = (data || []).filter((n: any) => n.user_id === userId || n.user_id === null);
            return filtered as Notification[];
        } catch (e: any) {
            console.error('Exception fetching notifications:', e.message);
            return [];
        }
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) console.error('Error marking notification as read:', error);
    },

    /**
     * Mark all for a user as read
     */
    async markAllAsRead(userId: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId);

            if (error) {
                console.error('Error marking all as read:', JSON.stringify(error, null, 2));
            }
        } catch (e: any) {
            console.error('Exception marking all as read:', e.message);
        }
    },

    /**
     * Create a notification
     */
    async createNotification(params: {
        userId?: string | null; // Null for broadcast
        title: string;
        message: string;
        type: string;
        orderId?: string;
    }) {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: params.userId || null,
                title: params.title,
                message: params.message,
                type: params.type,
                order_id: params.orderId,
            });

        if (error) {
            console.error('Error creating notification:', error);
            return;
        }

        // TRIGGER PWA PUSH (Fire and forget)
        if (params.userId) {
            fetch('/api/send-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: params.userId,
                    title: params.title,
                    message: params.message
                })
            }).catch(err => console.error('Failed to trigger push API:', err));
        }
    }
};
