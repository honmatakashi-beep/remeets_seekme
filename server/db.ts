import db, { getDb, setDb, initDatabase } from "./db/schema";
export * from "./db/passwordPolicy";
export * from "./db/seedGenerators";
export * from "./db/seed";

export { db, getDb, setDb, initDatabase };
export default db;
