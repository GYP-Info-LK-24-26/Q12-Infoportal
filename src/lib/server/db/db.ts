import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '$env/static/private'
import mariadb, { type PoolConfig } from 'mariadb';

const config: PoolConfig = {
    host: DB_HOST,
    port: +DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    trace: process.env.NODE_ENV != 'production',
}

export const db = mariadb.createPool(config);