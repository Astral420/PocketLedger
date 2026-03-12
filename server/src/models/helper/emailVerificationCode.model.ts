import crypto from 'crypto';
import bcrypt from 'bcrypt';
import pool from "../../config/DB";

const OTP_EXPIRY_MINS = 10;

export const emailVerificationCode= async (userId: string): 
Promise<string>=> {
    const deleteQuery =`DELETE FROM email_verification_codes
                  WHERE user_id = $1
                  RETURNING *`;

    await pool.query(deleteQuery, [userId]);

    const rawCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(rawCode, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINS * 60 * 1000);

    const insertQuery = `INSERT INTO email_verification_codes 
                        (user_id, code_hash, expires_at)
                        VALUES ($1, $2, $3)
                        `;

    const values = [userId, codeHash, expiresAt];                    
    await pool.query(insertQuery, values);
    return rawCode;
};

export const consumeEmailVerificationCode = async (userId: string, rawCode:string):
    Promise<boolean> => {
        
        const selectQuery = `SELECT id, code_hash FROM email_verification_codes
                             WHERE user_id = $1 AND expires_at > NOW()`

        const { rows } = await pool.query(selectQuery, [userId]);

        for (const row of rows){
            const isMatch = await bcrypt.compare(rawCode, row.code_hash);
            if (isMatch){
                const deleteQuery = `DELETE FROM email_verification_codes
                                    WHERE id = $1
                                    RETURNING *`;
                await pool.query(deleteQuery, [row.id]);
                return true;
            }
        }
        return false;
    }