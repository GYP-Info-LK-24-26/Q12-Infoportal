import { error, json, type RequestHandler } from '@sveltejs/kit';
import type { LessonTime, Student } from '$lib/server/db/types';
import { db } from '$lib/server/db/db';

function getLessonTimes(): Promise<{start: string, end: string}[]> {
    return db.query('SELECT start, end FROM LessonTime');
}

function getDaysOfTheWeek(): Promise<string[]> {
    return db.query('SELECT name FROM Day');
}

type ScheduleData = {
    teacher: string,
    room: string,
    course: string,
    subject: string
}[][]

type LessonData = {
    day: number,
    time: number,
    teacher: string,
    room: string,
    course: string,
    subject: string
};

async function getLessons(student: Student, daysOfTheWeek: string[]): Promise<ScheduleData> {
    const rs = await db.query(
        'SELECT Lesson.day - 1 AS day, Lesson.lessonTime - 1 AS time, Teacher.abbreviation AS teacher, Lesson.room, '
        + 'Course.name AS course, Course.subject FROM Lesson '
        + 'INNER JOIN Course ON Lesson.course = Course.id ' 
        + 'INNER JOIN StudentCourse ON Lesson.course = StudentCourse.course '
        + 'INNER JOIN Teacher ON Lesson.teacher = Teacher.id '
        + 'WHERE StudentCourse.student = ?', [
            student.id
        ]
    ) as LessonData[];
    let scheduleData: ScheduleData = [];
    for (let i = 0; i < daysOfTheWeek.length; i++) {
        scheduleData[i] = [];
    }
    for (let lessonData of rs) {
        scheduleData[lessonData.day][lessonData.time] = {
            teacher: lessonData.teacher,
            room: lessonData.room,
            course: lessonData.course,
            subject: lessonData.subject
        };
    }
    return scheduleData;
}

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.student) {
        error(401, 'Unauthorized');
    }

    const daysOfTheWeek = await getDaysOfTheWeek();

    const data = {
        lessonTimes: await getLessonTimes(),
        daysOfTheWeek: daysOfTheWeek,
        lessons: await getLessons(locals.student, daysOfTheWeek)
    };

    return json(data);
}