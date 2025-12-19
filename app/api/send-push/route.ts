import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { supabase } from '@/lib/supabase'; // Beware: this is client-side supabase. ideally we need service_role for backend... 
// actually we can use client if RLS allows or if we just fetch subscriptions.
// For sending push, we don't need Supabase if we pass the sub in body? 
// No, usually we want to "Send to User X", so we need to fetch their subs from DB.

// We need a server-side supabase client or just use the public one if Policies allow "Select" for everyone (which we did).

const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!
};

webPush.setVapidDetails(
    'mailto:soporte@ayg.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

export async function POST(request: Request) {
    try {
        const { userId, title, message } = await request.json();

        if (!userId || !title || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Fetch subscriptions for user
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            console.log('No subscriptions found for user', userId);
            return NextResponse.json({ message: 'No subscriptions' });
        }

        // 2. Send Push to all subs
        const payload = JSON.stringify({ title, body: message, icon: '/logo-a&g.svg' });

        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            return webPush.sendNotification(pushSubscription, payload)
                .catch(err => {
                    if (err.statusCode === 410) {
                        // Subscription expired, delete from DB
                        return supabase.from('push_subscriptions').delete().eq('id', sub.id);
                    }
                    console.error('Error sending push', err);
                });
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('API Error', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
