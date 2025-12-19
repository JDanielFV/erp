import { supabase } from '@/lib/supabase';

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const pushService = {
    async registerSubscription(userId: string) {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push messaging isn\'t supported.');
            return;
        }

        try {
            // 1. Register Service Worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration.scope);

            // 2. Check current subscription
            let subscription = await registration.pushManager.getSubscription();

            // 3. If no subscription, subscribe
            if (!subscription) {
                if (!PUBLIC_VAPID_KEY) {
                    console.error('VAPID Public Key is missing!');
                    return;
                }
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                });
            }

            // 4. Send subscription to DB
            // Check if already exists in DB to avoid dupes? Or just upsert based on endpoint.
            const subJson = subscription.toJSON();

            // Simple check based on endpoint to avoid duplicates
            const { data: existing } = await supabase
                .from('push_subscriptions')
                .select('id')
                .eq('endpoint', subJson.endpoint!)
                .single();

            if (!existing) {
                await supabase.from('push_subscriptions').insert({
                    user_id: userId,
                    endpoint: subJson.endpoint!,
                    p256dh: subJson.keys?.p256dh || '',
                    auth: subJson.keys?.auth || '',
                    user_agent: navigator.userAgent
                });
                console.log('Push Subscription saved to DB.');
            }

        } catch (error) {
            console.error('Error registering push subscription:', error);
        }
    }
};
