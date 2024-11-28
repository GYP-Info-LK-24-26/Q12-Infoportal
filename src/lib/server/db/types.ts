export interface Student {
    id: number;
    firstName: string;
    lastName: string;
    birth: string;
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
    number: number;
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
    lesson: number,
    substituteTeacher: number,
    substituteCourse: number,
    substituteRoom: string,
    note: string
};