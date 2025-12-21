#!/bin/bash
# Script de démarrage du serveur EquiLibre Backend
# Ce script nettoie les variables d'environnement potentiellement conflictuelles

# Supprimer les variables d'environnement qui pourraient être en cache
unset DB_USER
unset DB_PASSWORD
unset DB_HOST
unset DB_PORT
unset DB_NAME

# Démarrer le serveur en mode développement
npm run dev
