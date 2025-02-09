import type { Handle } from '@sveltejs/kit';
import { JWT_ACCESS_SECRET } from '$env/static/private'
import jwt from 'jsonwebtoken';
import type { Student } from '$lib/server/db/types';
import { db } from '$lib/server/db/db';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get("token");

    if (token) {
        try {
            const jwtUser = jwt.verify(token, JWT_ACCESS_SECRET);
            if (typeof jwtUser == 'string') {
                throw new Error('Something went wrong');
            }

            const rs = await db.query('SELECT * FROM Student WHERE id = ?', [
                jwtUser.studentId
            ]) as Student[];

            if (!rs) {
                throw new Error('User not found');
            }

            const student = rs[0];

            event.locals.student = student;
        } catch (error) {
            event.cookies.delete('token', { path: '/' });
            console.log(error)
        }
    }

    return resolve(event);
}; 