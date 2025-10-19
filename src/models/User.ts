import { Schema, model, models, type Model, type Types } from "mongoose";

export type UserRole = "client" | "organization";

export interface IUser {
  _id: Types.ObjectId;
  fname: string;
  lname: string;
  email: string;
  password: string;
  role: UserRole;
}

const UserSchema = new Schema<IUser>(
  {
    fname: { type: String, required: true, trim: true },
    lname:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, index: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ["client", "organization"], default: "client", required: true },
  },
  { timestamps: true }
);

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
export default User;
// src/models/User.ts




// import { query } from "@/lib/mysql";
// import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// export type UserRole = "client" | "organization";

// // App-facing type (keeps _id as string for compatibility)
// export interface IUser {
//   id: number;   // MySQL PK
//   _id: string;  // string mirror of id
//   fname: string;
//   lname: string;
//   email: string;
//   password: string; // bcrypt hash
//   role: UserRole;
//   phone?: string;
//   bio?: string;
//   title?: string;
//   location?: string;
//   image?: string;
// }

// // Raw DB row type MUST extend RowDataPacket
// type DbUserRow = RowDataPacket & {
//   id: number;
//   email: string;
//   password: string;
//   fname: string;
//   lname: string;
//   role: "client" | "organization";
//   phone?: string;
//   bio?: string;
//   title?: string;
//   location?: string;
//   image?: string;
// };

// function toIUser(row: DbUserRow): IUser {
//   return {
//     id: row.id,
//     _id: String(row.id),
//     email: row.email,
//     password: row.password,
//     fname: row.fname ?? "",
//     lname: row.lname ?? "",
//     role: (row.role as UserRole) ?? "client",
//     phone: row.phone ?? "",
//     bio: row.bio ?? "",
//     title: row.title ?? "",
//     location: row.location ?? "",
//     image: row.image ?? "",
//   };
// }

// /** Find one user by email */
// async function findOne(where: { email?: string }): Promise<IUser | null> {
//   if (where.email) {
//     const [rows] = await query<DbUserRow[]>(
//       "SELECT * FROM users WHERE email = ? LIMIT 1",
//       [where.email]
//     );
//     const row = rows[0];
//     return row ? toIUser(row) : null;
//   }
//   return null;
// }

// /** Find by ID */
// async function findById(id: number | string): Promise<IUser | null> {
//   const numericId = Number(id);
//   const [rows] = await query<DbUserRow[]>(
//     "SELECT * FROM users WHERE id = ? LIMIT 1",
//     [numericId]
//   );
//   const row = rows[0];
//   return row ? toIUser(row) : null;
// }

// /** Update by ID (only allowed fields) */
// async function findByIdAndUpdate(
//   id: number | string,
//   patch: Partial<
//     Pick<
//       IUser,
//       "fname" | "lname" | "email" | "role" | "phone" | "bio" | "title" | "location" | "image"
//     >
//   >
// ): Promise<IUser | null> {
//   const numericId = Number(id);

//   const fields: string[] = [];
//   const values: any[] = [];
//   const allowed: (keyof typeof patch)[] = [
//     "fname",
//     "lname",
//     "email",
//     "role",
//     "phone",
//     "bio",
//     "title",
//     "location",
//     "image",
//   ];

//   for (const key of allowed) {
//     const v = patch[key];
//     if (typeof v !== "undefined") {
//       fields.push(`${key} = ?`);
//       values.push(v);
//     }
//   }

//   if (fields.length === 0) {
//     return await findById(numericId);
//   }

//   values.push(numericId);
//   // UPDATE -> ResultSetHeader
//   await query<ResultSetHeader>(
//     `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
//     values
//   );

//   return await findById(numericId);
// }

// /** Create a new user (password must be bcrypt hash) */
// async function create(data: {
//   email: string;
//   password: string; // bcrypt hash
//   fname?: string;
//   lname?: string;
//   role?: UserRole;
// }): Promise<IUser> {
//   const fname = (data.fname ?? "").trim();
//   const lname = (data.lname ?? "").trim();
//   const role: UserRole = data.role ?? "client";

//   // INSERT -> ResultSetHeader
//   const [result] = await query<ResultSetHeader>(
//     "INSERT INTO users (email, password, fname, lname, role) VALUES (?, ?, ?, ?, ?)",
//     [data.email.toLowerCase(), data.password, fname, lname, role]
//   );

//   const newId = Number(result.insertId);
//   const u = await findById(newId);
//   if (!u) throw new Error("Failed to create user");
//   return u;
// }

// /** Check if an email is used by another user */
// async function emailTakenByAnother(email: string, exceptUserId: number): Promise<boolean> {
//   type CountRow = RowDataPacket & { c: number };
//   const [rows] = await query<CountRow[]>(
//     "SELECT COUNT(*) AS c FROM users WHERE email = ? AND id <> ?",
//     [email.toLowerCase(), exceptUserId]
//   );
//   return (rows[0]?.c ?? 0) > 0;
// }

// const User = {
//   findOne,
//   findById,
//   findByIdAndUpdate,
//   create,
//   emailTakenByAnother,
// };

// export default User;
