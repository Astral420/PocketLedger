import pool from "../config/DB";
import bcrypt from "bcrypt";


export const createUser = async (full_name: string, email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (full_name, email, password_hash) 
                   VALUES ($1, $2, $3) RETURNING id, full_name, email, role ,created_at`;

    const values = [full_name, email, hashedPassword];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getUserByEmail = async (email: string) => {
    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows [0] ?? null;
};

export const getAllUsers = async () => {
    const query = "SELECT id, full_name, email, created_at FROM users";
    const { rows } = await pool.query(query);
    return rows;
};

export const deleteUser = async (id: string) => {
    const query = "DELETE FROM users WHERE id = $1 RETURNING *";
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows [0];
};

export const updateUserImage = async (id: string, profile_image: string | null) => {
    const query = `UPDATE users SET profile_image = $2, updated_at = NOW() 
                   WHERE id = $1 RETURNING id, profile_image, updated_at`;
    const values = [id, profile_image];
    const { rows } = await pool.query(query, values);
    return rows[0];
};


export const getUserAuthById = async (id: string) => {
  const query = `
    SELECT id, full_name, email, role
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] ?? null;
};




    