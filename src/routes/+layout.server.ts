import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const student = event.locals.student;

    return {
        user: student ? { firstName: student.firstName, lastName: student.lastName } : undefined
    };
}