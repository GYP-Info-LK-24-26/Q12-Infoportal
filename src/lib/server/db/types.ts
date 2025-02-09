export interface Student {
    id: number;
    firstName: string;
    lastName: string;
    birth: Date;
    confession: string;
};

export interface Teacher {
    id: number;
    abbreviation: string;
    firstName: string;
    title: string;
    surname: string;
    jobTitle: string;
};

export interface Course {
    id: number;
    name: string;
    subject: string;
};

export interface Day {
    id: number;
    name: string;
};

export interface LessonTime {
    id: number;
    start: string;
    end: string;
};

export interface Lesson {
    id: number;
    course: number;
    day: number;
    lessonTime: number;
    teacher: number;
    room: string;
};

export interface TeacherSubject {
    teacher: number;
    subject: string;
};

export interface StudentCourse {
    student: number;
    course: number;
};

export interface Substitution {
    id: number,
    lesson: number,
    date: Date,
    substituteTeacher: number,
    substituteCourse: number,
    substituteRoom: string,
    note: string
};

export interface PushSubscription {
    id: number,
    endpoint: string,
    p256dh: string,
    auth: string
}