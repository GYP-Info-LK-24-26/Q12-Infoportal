import webpush from 'web-push';
import { db } from '$lib/server/db/db'
import type { PushSubscription } from '$lib/server/db/types'
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '$env/static/private';

webpush.setVapidDetails(
    'mailto:you@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export function sendPushNotifications(title: string, content: string) {
    const getSubscriptions = db.prepare('SELECT * FROM Subsription');
    const subscriptions = getSubscriptions.all() as Subscription[];

    subscriptions.forEach((sub) => {
        const payload = JSON.stringify({ title, content });

        webpush.sendNotification(
            {
                endpoint: sub.endpoint,
                keys: { auth: sub.auth, p256dh: sub.p256dh }
            },
            payload
        ).catch((err) => console.error('Push-Fehler:', err));
    });
}