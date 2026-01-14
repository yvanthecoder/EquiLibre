const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { query } = require('../config/database');
const { ERROR_MESSAGES } = require('../config/constants');

const getAssignmentsData = async () => {
    const sql = `
        SELECT a.id,
               a.student_id,
               s.firstname as student_firstname,
               s.lastname as student_lastname,
               s.email as student_email,
               c.name as class_name,
               m.firstname as maitre_firstname,
               m.lastname as maitre_lastname,
               t.firstname as tuteur_firstname,
               t.lastname as tuteur_lastname,
               a.assigned_at
        FROM assignments a
        LEFT JOIN users s ON s.id = a.student_id
        LEFT JOIN users m ON m.id = a.maitre_id
        LEFT JOIN users t ON t.id = a.tuteur_id
        LEFT JOIN classes c ON c.id = s.class_id
        ORDER BY a.assigned_at DESC
    `;
    const result = await query(sql);
    return result.rows;
};

const exportAssignments = async (req, res) => {
    try {
        const format = (req.query.format || 'csv').toLowerCase();
        const rows = await getAssignmentsData();

        if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Assignations');
            sheet.columns = [
                { header: 'Etudiant', key: 'student', width: 25 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Classe', key: 'class', width: 25 },
                { header: 'Maitre', key: 'maitre', width: 25 },
                { header: 'Tuteur', key: 'tuteur', width: 25 },
                { header: 'Date', key: 'date', width: 20 }
            ];

            rows.forEach((row) => {
                sheet.addRow({
                    student: `${row.student_firstname || ''} ${row.student_lastname || ''}`.trim(),
                    email: row.student_email || '',
                    class: row.class_name || '',
                    maitre: row.maitre_firstname ? `${row.maitre_firstname} ${row.maitre_lastname}` : '',
                    tuteur: row.tuteur_firstname ? `${row.tuteur_firstname} ${row.tuteur_lastname}` : '',
                    date: row.assigned_at ? new Date(row.assigned_at).toISOString().slice(0, 10) : ''
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="assignations.xlsx"');
            await workbook.xlsx.write(res);
            return res.end();
        }

        if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 40 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="assignations.pdf"');
            doc.pipe(res);

            doc.fontSize(16).text('Rapport Assignations', { align: 'center' });
            doc.moveDown();

            rows.forEach((row) => {
                const line = [
                    `${row.student_firstname || ''} ${row.student_lastname || ''}`.trim(),
                    row.class_name || '',
                    row.maitre_firstname ? `Maitre: ${row.maitre_firstname} ${row.maitre_lastname}` : 'Maitre: -',
                    row.tuteur_firstname ? `Tuteur: ${row.tuteur_firstname} ${row.tuteur_lastname}` : 'Tuteur: -'
                ].join(' | ');
                doc.fontSize(10).text(line);
            });

            doc.end();
            return;
        }

        // CSV par défaut
        const header = ['Etudiant', 'Email', 'Classe', 'Maitre', 'Tuteur', 'Date'];
        const lines = rows.map((row) => ([
            `${row.student_firstname || ''} ${row.student_lastname || ''}`.trim(),
            row.student_email || '',
            row.class_name || '',
            row.maitre_firstname ? `${row.maitre_firstname} ${row.maitre_lastname}` : '',
            row.tuteur_firstname ? `${row.tuteur_firstname} ${row.tuteur_lastname}` : '',
            row.assigned_at ? new Date(row.assigned_at).toISOString().slice(0, 10) : ''
        ]));

        const csv = [header, ...lines].map((r) => r.join(';')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="assignations.csv"');
        return res.send(csv);
    } catch (error) {
        console.error('Erreur export assignations:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    exportAssignments
};
