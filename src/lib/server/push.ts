import webpush from 'web-push';
import { db } from '$lib/server/db/db'
import type { Subscription } from '$lib/server/db/types'

webpush.setVapidDetails(
    'mailto:you@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
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