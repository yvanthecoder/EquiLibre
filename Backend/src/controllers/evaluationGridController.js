const EvaluationGrid = require('../models/EvaluationGrid');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');

const getGrids = async (_req, res) => {
    try {
        const grids = await EvaluationGrid.findAll();
        return res.json({ success: true, data: grids });
    } catch (error) {
        console.error('Erreur lors de la récupération des grilles:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getGridById = async (req, res) => {
    try {
        const gridId = parseInt(req.params.id, 10);
        const grid = await EvaluationGrid.findById(gridId);
        if (!grid) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }
        return res.json({ success: true, data: grid });
    } catch (error) {
        console.error('Erreur lors de la récupération de la grille:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const createGrid = async (req, res) => {
    try {
        const { name, description, criteria } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const grid = await EvaluationGrid.create({
            name,
            description,
            createdBy: req.user.userId,
            criteria
        });
        return res.status(201).json({ success: true, data: grid });
    } catch (error) {
        console.error('Erreur lors de la création de la grille:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const updateGrid = async (req, res) => {
    try {
        const gridId = parseInt(req.params.id, 10);
        const updates = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.description !== undefined) updates.description = req.body.description;
        const updated = await EvaluationGrid.update(gridId, updates);
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la grille:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const deleteGrid = async (req, res) => {
    try {
        const gridId = parseInt(req.params.id, 10);
        await EvaluationGrid.delete(gridId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression de la grille:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    getGrids,
    getGridById,
    createGrid,
    updateGrid,
    deleteGrid
};
