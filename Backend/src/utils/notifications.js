const { query } = require('../config/database');

const createNotification = async ({ userId, title, message, type = 'INFO', link = null, metadata = null }) => {
    const sql = `
        INSERT INTO notifications (user_id, title, message, type, link, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `;
    const values = [userId, title, message, type, link, metadata];
    const result = await query(sql, values);
    return result.rows[0];
};

module.exports = {
    createNotification
};
