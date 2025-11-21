const { query } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Créer un nouvel utilisateur
    static async create({ email, password, firstname, lastname, role, company, phone, job_title, class_id, googleId }) {
        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (email, password, firstname, lastname, role, company, phone, job_title, class_id, google_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, email, firstname, lastname, role, company, phone, job_title, class_id, created_at, is_active
        `;

        const values = [email, hashedPassword, firstname, lastname, role, company, phone, job_title, class_id, googleId];
        const result = await query(sql, values);
        return result.rows[0];
    }

    // Trouver un utilisateur par email
    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = $1`;
        const result = await query(sql, [email]);
        return result.rows[0];
    }

    // Trouver un utilisateur par ID
    static async findById(id) {
        const sql = `
            SELECT id, email, firstname, lastname, role, company, phone, job_title, class_id,
                   profile_picture, created_at, last_login, is_active, is_verified
            FROM users
            WHERE id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    // Trouver par Google ID
    static async findByGoogleId(googleId) {
        const sql = `SELECT * FROM users WHERE google_id = $1`;
        const result = await query(sql, [googleId]);
        return result.rows[0];
    }

    // Vérifier le mot de passe
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Mettre à jour la date de dernière connexion
    static async updateLastLogin(userId) {
        const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`;
        await query(sql, [userId]);
    }

    // Obtenir tous les utilisateurs (Admin)
    static async findAll(filters = {}) {
        let sql = `
            SELECT id, email, firstname, lastname, role, company, phone, job_title, class_id,
                   profile_picture, created_at, last_login, is_active, is_verified
            FROM users
            WHERE 1=1
        `;
        const values = [];

        if (filters.role) {
            values.push(filters.role);
            sql += ` AND role = $${values.length}`;
        }

        if (filters.is_active !== undefined) {
            values.push(filters.is_active);
            sql += ` AND is_active = $${values.length}`;
        }

        sql += ` ORDER BY created_at DESC`;

        const result = await query(sql, values);
        return result.rows;
    }

    // Mettre à jour un utilisateur
    static async update(userId, updates) {
        const allowedFields = ['firstname', 'lastname', 'phone', 'company', 'profile_picture', 'job_title', 'class_id', 'password'];
        const fields = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(updates[key]);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            throw new Error('Aucun champ à mettre à jour');
        }

        values.push(userId);
        const sql = `
            UPDATE users
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id, email, firstname, lastname, role, company, phone, profile_picture, job_title, class_id
        `;

        const result = await query(sql, values);
        return result.rows[0];
    }

    // Supprimer un utilisateur (soft delete)
    static async delete(userId) {
        const sql = `UPDATE users SET is_active = false WHERE id = $1`;
        await query(sql, [userId]);
    }

    // Obtenir les utilisateurs d'une classe
    static async findByClassId(classId) {
        const sql = `
            SELECT u.id, u.email, u.firstname, u.lastname, u.role, u.company
            FROM users u
            INNER JOIN class_members cm ON u.id = cm.user_id
            WHERE cm.class_id = $1 AND u.is_active = true
            ORDER BY u.lastname, u.firstname
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }
}

module.exports = User;
