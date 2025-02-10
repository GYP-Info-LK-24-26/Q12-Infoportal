import { redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import type { Student } from '$lib/server/db/types'
import { db } from '$lib/server/db/db'
import { JWT_ACCESS_SECRET } from '$env/static/private'
import type { PageServerLoad } from './$types.js'

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.student) {
        redirect(302, '/');
    }
};

export const actions = {
    default: async (event) => {
        const formData = Object.fromEntries(await event.request.formData()) as { firstName: string; lastName: string, birth: string };
        if (!formData.firstName) {
            return {
                error: 'Bitte gib einen Vornamen an!'
            };
        }
        if (!formData.lastName) {
            return {
                error: 'Bitte gib einen Nachnamen an!'
            };
        }
        if (!formData.birth) {
            return {
                error: 'Bitte gib ein Geburtsdatum an!'
            };
        }

        const rs = await db.query("SELECT * FROM Student WHERE (firstName = ? OR firstName LIKE ? OR firstName LIKE ?) AND (lastName = ? OR lastName LIKE ? OR lastName LIKE ?) AND birth = ?", [
            formData.firstName, `${formData.firstName} %`, `% ${formData.firstName}`, formData.lastName, `${formData.lastName} %`, `% ${formData.lastName}`, formData.birth
        ]) as Student[];

        if (rs.length == 0) {
            return {
                error: "Ungültige Daten!"
            };
        }
        
        const student = rs[0];

        event.locals.student = student;

        event.cookies.set("token", jwt.sign({ studentId: student.id }, JWT_ACCESS_SECRET, { expiresIn: '7d' }), {
            path: "/",
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV == 'production',
            maxAge: 7 * 24 * 60 * 60
        });
        redirect(302, '/');
    }
};