import type Database from "better-sqlite3";
import type { Student } from "$lib/server/db/types";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			student?: Student;
		}

		interface PageData {
			user?: { firstName: string, lastName: string }
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
