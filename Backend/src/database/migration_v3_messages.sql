-- =============================================
-- MIGRATION V3 - SYSTÈME DE MESSAGERIE
-- =============================================

-- 1. Table des conversations (threads)
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des participants aux conversations
CREATE TABLE IF NOT EXISTS conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- 3. Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 4. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- 5. Fonction pour mettre à jour last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger pour mettre à jour automatiquement
DROP TRIGGER IF EXISTS update_conversation_timestamp ON messages;
CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- 7. Commentaires
COMMENT ON TABLE conversations IS 'Conversations entre utilisateurs';
COMMENT ON TABLE conversation_participants IS 'Participants d''une conversation';
COMMENT ON TABLE messages IS 'Messages dans les conversations';

SELECT '  Migration V3 (Messages) appliquée avec succès!' AS status;
