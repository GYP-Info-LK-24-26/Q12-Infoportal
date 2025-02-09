import cron from 'node-cron';
import { db } from '$lib/server/db/db';
import { sendPushNotifications } from './push';

async function fetchNews() {
    const response = await fetch('https://api.example.com/news');
    const news: { id: number; title: string; content: string }[] = await response.json();

    const insert = db.prepare('INSERT INTO messages (title, content) VALUES (?, ?)');
    const getLatest = db.prepare('SELECT id FROM messages ORDER BY id DESC LIMIT 1');

    for (const msg of news) {
        const exists = getLatest.get();
        if (!exists || exists.id !== msg.id) {
            insert.run(msg.title, msg.content);
            sendPushNotifications(msg.title, msg.content);
        }
    }
}

cron.schedule('*/10 * * * *', fetchNews);