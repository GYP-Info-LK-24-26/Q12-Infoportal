import { error, json, type RequestHandler } from '@sveltejs/kit';
import type { LessonTime, Lesson, Student } from '$lib/server/db/types';
import { getDB } from '$lib/server/db/db';

function getLessonTimes(): {start: string, end: string}[] {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM LessonTime ORDER BY number');
    const lessonTimes = stmt.all<LessonTime>();
    return lessonTimes.map(obj => ({ start: obj.start, end: obj.end }));
}

function getDaysOfTheWeek(): string[] {
    return [ 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag' ];
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

function getLessons(student: Student, daysOfTheWeek: string[]): ScheduleData {
    const db = getDB();
    const stmt = db.prepare(
        'SELECT Lesson.day - 1 AS day, Lesson.lessonTime - 1 AS time, Lesson.teacher, Lesson.room, '
        + 'Course.name AS course, Course.subject FROM Lesson '
        + 'INNER JOIN Course ON Lesson.course = Course.id ' 
        + 'INNER JOIN StudentCourse ON Lesson.course = StudentCourse.course '
        + 'WHERE StudentCourse.student = $studentId'
    );
    const lessonDataArray = stmt.all<LessonData>({ studentId: student.id });
    let scheduleData: ScheduleData = [];
    for (let i = 0; i < daysOfTheWeek.length; i++) {
        scheduleData[i] = [];
    }
    for (var lessonData of lessonDataArray) {
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

    const daysOfTheWeek = getDaysOfTheWeek();

    const data = {
        lessonTimes: getLessonTimes(),
        daysOfTheWeek: daysOfTheWeek,
        lessons: getLessons(locals.student, daysOfTheWeek)
    };

    return json(data);
}