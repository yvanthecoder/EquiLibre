const { query } = require('../config/database');

class Event {
  static async create(eventData) {
    const text = `
      INSERT INTO events (title, description, start_date, end_date, type, class_id, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id,
                title,
                description,
                start_date as "startDate",
                end_date as "endDate",
                type,
                class_id as "classId",
                created_by as "createdBy",
                created_at as "createdAt",
                updated_at as "updatedAt"
    `;
    const values = [
      eventData.title,
      eventData.description || null,
      eventData.startDate,
      eventData.endDate,
      eventData.type,
      eventData.classId,
      eventData.userId
    ];
    
    try {
      const result = await query(text, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la crAcation d\'un AcvAcnement:', error);
      throw error;
    }
  }

  static async findById(id) {
    const text = `
      SELECT id,
             title,
             description,
             start_date as "startDate",
             end_date as "endDate",
             type,
             class_id as "classId",
             created_by as "createdBy",
             created_at as "createdAt",
             updated_at as "updatedAt"
      FROM events WHERE id = $1
    `;
    try {
      const result = await query(text, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'un AcvAcnement:', error);
      throw error;
    }
  }

  static async findByClassId(classId) {
    const text = `
      SELECT id,
             title,
             description,
             start_date as "startDate",
             end_date as "endDate",
             type,
             class_id as "classId",
             created_by as "createdBy",
             created_at as "createdAt",
             updated_at as "updatedAt"
      FROM events 
      WHERE class_id = $1
      ORDER BY start_date ASC
    `;
    try {
      const result = await query(text, [classId]);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la recherche des AcvAcnements:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const allowedFields = ['title', 'description', 'start_date', 'end_date', 'type'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const text = `
      UPDATE events 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id,
                title,
                description,
                start_date as "startDate",
                end_date as "endDate",
                type,
                class_id as "classId",
                created_by as "createdBy",
                created_at as "createdAt",
                updated_at as "updatedAt"
    `;

    try {
      const result = await query(text, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la mise A� jour d\'un AcvAcnement:', error);
      throw error;
    }
  }

  static async delete(id) {
    const text = `DELETE FROM events WHERE id = $1`;
    try {
      await query(text, [id]);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression d\'un AcvAcnement:', error);
      throw error;
    }
  }
}

module.exports = Event;
