import pool from "../config/DB";

export interface Category { 
    id: string;
    user_id: string;
    name: string;
    description: string;
    icon_key: string | null;
    color: string | null;
    is_active: boolean;
    created_at: string;
}

export const seedDefaultCategories = async (userId: string):
Promise<void> => {
    const query = 'SELECT seed_default_categories($1)';
    await pool.query(query, [userId]);
};

export const getUserCategories = async (userId: string):
Promise<Category[]> => {
    const query = `
    SELECT id, user_id, name, description, icon_key, color, is_active, created_at
    FROM categories
    WHERE user_id = $1 AND is_active = TRUE
    ORDER BY created_at ASC
    `;

    const result = await pool.query<Category>(query, [userId]);
    return result.rows;
};

export const createCategory = async(
    userId: string,
    name: string,
    iconKey?: string | null,
    color?: string | null,
    description?: string 
): Promise<Category> => {
    const query = `
        INSERT INTO categories (user_id, name, icon_key, color, description)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id, user_id, name, description, icon_key, color, is_active, created_at
    `;

    const values = [userId, name.trim(), iconKey ?? null, color ?? null, description];
    const result = await pool.query<Category>(query, values);
    return result.rows[0];
};

export const deactivateCategory = async (userId: string, categoryId: string):
Promise<void> => {
    const query = `
        UPDATE categories SET is_active = FALSE, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
    `;

    await pool.query(query, [categoryId, userId]);
};

