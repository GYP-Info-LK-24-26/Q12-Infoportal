import { redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import type { Student } from '$lib/server/db/types'
import { getDB } from '$lib/server/db/db'
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

        const test = {
            firstName: formData.firstName,
            firstName1: `${formData.firstName} %`,
            firstName2: `% ${formData.firstName}`,
            lastName: formData.lastName,
            lastName1: `${formData.lastName} %`,
            lastName2: `% ${formData.lastName}`,
            birth: formData.birth
        };

        const db = getDB();
        const select = db.prepare("SELECT * FROM Student WHERE (firstName = $firstName OR firstName LIKE $firstName1 OR firstName LIKE $firstName2) AND (lastName = $lastName OR lastName LIKE $lastName1 OR lastName LIKE $lastName2) AND birth = $birth");
        const student = select.get<Student>(test);
        if (!student) {
            return {
                error: "Ungültige Daten!"
            };
        }

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