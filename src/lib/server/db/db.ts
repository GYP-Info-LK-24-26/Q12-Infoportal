import Database from 'better-sqlite3'
import { DB_PATH } from '$env/static/private'

const db = new Database(DB_PATH, { fileMustExist: true, readonly: true, verbose: console.log });
//db.pragma("journal_mode = WAL");

export function getDB() {
    return db;
} 