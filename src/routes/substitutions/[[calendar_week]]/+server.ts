import { error, json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import { page } from '$app/state';
import type { Student, Substitution } from '$lib/server/db/types';

function getSubstitutions(stutent: Student, calendar_week: number): Promise<Substitution[]> {
    return db.query('SELECT * FROM Substitution '
        + 'WHERE lesson IN ('
        +   'SELECT Lesson.id FROM Lesson '
        +   'INNER JOIN StudentCourse ON Lesson.course = StudentCourse.course '
        +   'WHERE StudentCourse.student = ? '
        + ') '
        + 'AND WEEK(date) = ?', [
        stutent.id, calendar_week
    ]);
}

export const GET: RequestHandler = async ({ params, locals }) => {
    if (!locals.student) {
        error(401, 'Unauthorized');
    }

    return json(await getSubstitutions(locals.student, params.calendar_week || 2));
}