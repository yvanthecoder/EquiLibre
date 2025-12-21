#!/bin/bash

echo "╔═══════════════════════════════════════╗"
echo "║  TEST DE CONNEXION - TOUS LES USERS   ║"
echo "╚═══════════════════════════════════════╝"
echo ""

API_URL="http://localhost:5001/api/auth/login"
PASSWORD="password123"

# Fonction pour tester une connexion
test_login() {
    local email=$1
    local role=$2

    echo -n "Testing $email ($role)... "

    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\"}")

    success=$(echo "$response" | grep -o '"success":true' || echo "")

    if [ -n "$success" ]; then
        echo "✅ OK"
        return 0
    else
        echo "❌ ÉCHEC"
        echo "   Réponse: $response"
        return 1
    fi
}

# Test de tous les utilisateurs
echo "=== ADMIN ==="
test_login "admin@equilibre.com" "ADMIN"
echo ""

echo "=== TUTEURS ÉCOLE ==="
test_login "tuteur1@equilibre.com" "TUTEUR_ECOLE"
test_login "tuteur2@equilibre.com" "TUTEUR_ECOLE"
echo ""

echo "=== MAÎTRES D'APPRENTISSAGE ==="
test_login "maitre1@entreprise.com" "MAITRE_APP"
test_login "maitre2@entreprise.com" "MAITRE_APP"
echo ""

echo "=== ALTERNANTS ==="
test_login "alternant1@student.com" "ALTERNANT"
test_login "alternant2@student.com" "ALTERNANT"
echo ""

echo "=== ÉTUDIANTS CLASSIQUES ==="
test_login "etudiant1@student.com" "ETUDIANT_CLASSIQUE"
test_login "etudiant2@student.com" "ETUDIANT_CLASSIQUE"
echo ""

echo "╔═══════════════════════════════════════╗"
echo "║         TESTS TERMINÉS                ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "📋 RAPPEL:"
echo "   Mot de passe pour tous: password123"
echo "   URL API: $API_URL"
