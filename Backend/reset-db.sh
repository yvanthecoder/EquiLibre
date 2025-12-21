#!/bin/bash
# Script de réinitialisation de la base de données avec données de test

echo "╔═══════════════════════════════════════╗"
echo "║  RÉINITIALISATION DE LA BASE DE       ║"
echo "║  DONNÉES AVEC DONNÉES DE TEST         ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Supprimer les variables d'environnement qui pourraient être en cache
unset DB_USER
unset DB_PASSWORD
unset DB_HOST
unset DB_PORT
unset DB_NAME

# Réinitialiser la base de données avec les données de seed
npm run db:init -- --seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Base de données réinitialisée avec succès!"
    echo ""
    echo "📋 Identifiants de test disponibles :"
    echo "   - Admin: admin@equilibre.com / password123"
    echo "   - Tuteur: tuteur1@equilibre.com / password123"
    echo "   - Alternant: alternant1@student.com / password123"
    echo "   - Étudiant: etudiant1@student.com / password123"
    echo ""
    echo "📚 8 classes disponibles :"
    echo "   - Prepa 1, Prepa 2"
    echo "   - E3E, E4E, E5E (Étudiants classiques)"
    echo "   - E3A, E4A, E5A (Alternance)"
    echo ""
    echo "📖 Voir EXEMPLES_API.md pour plus de détails"
else
    echo ""
    echo "❌ Échec de la réinitialisation"
    exit 1
fi
