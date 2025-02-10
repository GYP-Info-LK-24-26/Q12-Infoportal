import { db } from '$lib/server/db/db';
import { sendPushNotifications } from './push';
import { ELTERNPORTAL_USERNAME, ELTERNPORTAL_PASSWORD } from '$env/static/private';
import makeFetchCookie from 'fetch-cookie';
import { parse, SyntaxKind, walk } from 'html5parser';
import type { Substitution } from './db/types';

const ROOT_URL = 'https://gypenz.eltern-portal.org';
const LK_SUBJECTS = ['b', 'ph', 'ku', 'smw', 'e', 'inf', 'g'];

const fetchCookie = makeFetchCookie(fetch);

function translateCourseName(elternportalName: string | undefined): string | undefined {
    const match = elternportalName?.match(/([a-zA-Z]+)_(?:\d_)?(\d+)/);
    if (!match) {
        return undefined;
    }

    const subject = match[1];
    const id = +match[2];
    if (id === 6) {
        return `2w${subject.toLowerCase()}`;
    } else if (LK_SUBJECTS.includes(subject.toLowerCase())) {
        return `2${id === 1 ? subject.toUpperCase() : subject.toLowerCase()}${Math.max(id - 1, 1)}`
    } else {
        return `2${subject.toLowerCase()}${id}`;
    }
}

function handleSubstitution(date: Date, lessonTime: number, teacherAbbr: string, substituteTeacherAbbr: string | undefined, courseName: string, substituteCourseName: string | undefined, room: string | undefined, substituteRoom: string | undefined, note: string | undefined) {
    db.query('INSERT IGNORE INTO Substitution (lesson, date, dropped, substituteTeacher, substituteCourse, substituteRoom, note) '
        + 'VALUES ((SELECT Lesson.id FROM Lesson INNER JOIN Course ON Lesson.course = Course.id WHERE Lesson.lessonTime = ? AND Course.name = ? AND day = WEEKDAY(?) + 1), ?, ?, (SELECT id FROM Teacher WHERE abbreviation = ?), (SELECT id FROM Course WHERE name = ?), ?, ?)', [
        lessonTime, courseName, date, date, true /* FIXME */, substituteTeacherAbbr, substituteCourseName, substituteRoom, note
    ]);
}

export async function fetchSubstitutions() {
    const csrfResponse = await fetchCookie(ROOT_URL);
    const csrfText = await csrfResponse.text();
    let csrfToken;
    walk(parse(csrfText, { setAttributeMap: true }), {
        enter: (node) => {
            if (node.type === SyntaxKind.Tag && node.name === 'input' && node.attributeMap?.['name']?.value?.value === 'csrf') {
                csrfToken = node.attributeMap?.['value']?.value?.value;
                return;
            }
        }
    });
    if (!csrfToken) {
        console.error('Failed to fetch csrf token');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('csrf', csrfToken);
    formData.append('username', ELTERNPORTAL_USERNAME);
    formData.append('password', ELTERNPORTAL_PASSWORD);
    formData.append('go_to', 'gypenz.eltern-portal.org/service/vertretungsplan');

    const substitutionResponse = await fetchCookie(`${ROOT_URL}/includes/project/auth/login.php`, {
        method: 'POST',
        body: formData
    });
    const substitutionText = await substitutionResponse.text();

    let lastDate: Date | undefined;
    walk(parse(substitutionText, { setAttributeMap: true }), {
        enter: (node) => {
            if (node.type == SyntaxKind.Text) {
                const dateMatch = node.value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                if (dateMatch) {
                    lastDate = new Date(+dateMatch[3], +dateMatch[2] - 1, +dateMatch[1]);
                }
            } else if (node.type === SyntaxKind.Tag && node.name === 'table' && node.attributeMap?.['style']?.value?.value === 'min-width: 75%;') {
                const rows = node.body;
                if (!rows) {
                    return;
                }

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (row?.type !== SyntaxKind.Tag) {
                        continue;
                    }

                    const columns = row.body?.flatMap(tag => tag?.type === SyntaxKind.Tag
                        ? tag
                        : undefined
                    );
                    if (columns?.length !== 6) {
                        continue;
                    }

                    const lessonTime = columns[0]?.body?.[0]?.type === SyntaxKind.Text
                        ? +columns[0].body[0].value.replace('.', '')
                        : undefined;

                    const teacher = columns[1]?.body?.[0]?.type === SyntaxKind.Text
                        ? columns[1].body[0].value
                        : undefined;

                    const substituteTeacher = columns[2]?.body?.[0]?.type === SyntaxKind.Text
                        ? columns[2].body[0].value.replaceAll('&nbsp;', '') || undefined
                        : undefined;

                    let course = columns[3]?.body?.[0]?.type === SyntaxKind.Tag
                        ? columns[3].body[0].body?.[0]?.type === SyntaxKind.Text
                            ? columns[3].body[0].body[0].value?.replaceAll('&nbsp;', '')
                            : undefined
                        : columns[3]?.body?.[0]?.value;
                    course = translateCourseName(course);

                    let substituteCourse = columns[3]?.body?.[1]?.type === SyntaxKind.Text
                        ? columns[3].body[1].value?.trim()
                        : undefined;
                    substituteCourse = translateCourseName(substituteCourse);
                    if (course === substituteCourse) {
                        substituteCourse = undefined;
                    }

                    const room = columns[4]?.body?.[0]?.type == SyntaxKind.Text
                        ? columns[4].body[0].value
                        : undefined;

                    const note = columns[5]?.body?.[0]?.type == SyntaxKind.Text
                        ? columns[5].body[0].value?.replace('-', '')
                        : undefined;

                    //console.log(`${lastDate} ${lessonTime} ${teacher} ${substituteTeacher} ${course} ${substituteCourse} ${room} ${note}`);

                    if (!lastDate || !lessonTime || !teacher || !course) {
                        continue;
                    }

                    handleSubstitution(lastDate, lessonTime, teacher, substituteTeacher, course, substituteCourse, room, undefined, note);
                }
            }
        }
    });
}