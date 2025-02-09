import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
    redirect(302, '/');
};

export const actions = {
    default: async (event) => {
        event.cookies.delete('token', { path: '/' });
    }
};