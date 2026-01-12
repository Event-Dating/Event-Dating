-- Схема базы данных для Event Dating App

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица мероприятий
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cover_variant VARCHAR(50) DEFAULT 'mint',
    description TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица участников мероприятий
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_author_id ON events(author_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Таблица свайпов
CREATE TABLE IF NOT EXISTS swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right')),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, target_id, event_id)
);

-- Таблица чатов
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id, event_id),
    CHECK (user1_id != user2_id)
);

-- Таблица сообщений (опционально для будущего расширения)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target_id ON swipes(target_id);
CREATE INDEX IF NOT EXISTS idx_chats_user1_id ON chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2_id ON chats(user2_id);

-- ВСТАВКА ТЕСТОВЫХ ДАННЫХ

-- Сначала создаем тестового пользователя (автора мероприятия)
INSERT INTO users (id, name, email, password_hash, age, gender, bio, interests)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Тестовый Организатор',
    'organizer@test.com',
    -- Пароль: test123 (захешированный)
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeAJZv6dJ5ghE1D7/7bLzJYbQ6H4X1W6S',
    30,
    'male',
    'Люблю организовывать интересные мероприятия и знакомить людей',
    '["Музыка", "Еда", "Культура"]'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Создаем тестовых пользователей для свайпинга
INSERT INTO users (id, name, email, password_hash, age, gender, bio, interests)
VALUES 
(
    '00000000-0000-0000-0000-000000000002',
    'Анна',
    'anna@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeAJZv6dJ5ghE1D7/7bLzJYbQ6H4X1W6S',
    23,
    'female',
    'Люблю активный отдых и походы в горы. Ищу компанию для поездки на фестиваль!',
    '["Спорт", "Путешествия", "Музыка"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000003',
    'Алексей',
    'alex@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeAJZv6dJ5ghE1D7/7bLzJYbQ6H4X1W6S',
    27,
    'male',
    'Фанат джаза и крафтового пива. Буду рад новым знакомствам.',
    '["Музыка", "Еда", "Кино"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000004',
    'Мария',
    'maria@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeAJZv6dJ5ghE1D7/7bLzJYbQ6H4X1W6S',
    21,
    'female',
    'Учусь на дизайнера, обожаю выставки современного искусства.',
    '["Культура", "Кино", "Прогулка"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000005',
    'Дмитрий',
    'dmitry@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeAJZv6dJ5ghE1D7/7bLzJYbQ6H4X1W6S',
    25,
    'male',
    'Играю на гитаре, люблю настолки и квизы.',
    '["Игры", "Музыка", "Спорт"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000006',
    'Елена',
    'elena@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeAJZv6dJ5ghE1D7/7bLzJYbQ6H4X1W6S',
    24,
    'female',
    'Веган, йога-инструктор. Ищу единомышленников.',
    '["Спорт", "Еда", "Путешествия"]'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Создаем тестовое мероприятие
INSERT INTO events (id, title, category, starts_at, cover_variant, description, author_id)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Фестиваль Электронной Музыки "Future Beats"',
    'Музыка',
    '2024-12-25T20:00:00Z',
    'mint',
    'Крупнейший фестиваль электронной музыки в этом году! Будут выступать лучшие диджеи со всего мира. 3 сцены, фудкорт, зона отдыха.',
    '00000000-0000-0000-0000-000000000001'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Йога в Центральном Парке',
    'Спорт',
    '2024-12-20T10:00:00Z',
    'blue',
    'Бесплатные занятия йогой для всех желающих. Приносите свои коврики! Занятия проводит сертифицированный инструктор.',
    '00000000-0000-0000-0000-000000000001'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Дегустация Итальянских Вин',
    'Еда',
    '2024-12-22T19:00:00Z',
    'red',
    'Попробуйте лучшие вина региона с профессиональным сомелье. Также будет сырная тарелка и живая музыка.',
    '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- Записываем тестовых пользователей на мероприятия
INSERT INTO event_participants (event_id, user_id)
VALUES 
-- Все пользователи на фестиваль музыки
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000005'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000006'),

-- Некоторые пользователи на йогу
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000006'),

-- Некоторые пользователи на дегустацию вин
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000004'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000005')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Создаем тестового пользователя для текущей сессии (ваш пользователь)
INSERT INTO users (id, name, email, password_hash, age, gender, bio, interests)
VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    'Текущий Пользователь',
    'current@user.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeAJZv6dJ5ghE1D7/7bLzJYbQ6H4X1W6S',
    28,
    'male',
    'Тестирую приложение для знакомств на мероприятиях. Люблю технологии и новые знакомства!',
    '["Технологии", "Музыка", "Путешествия", "Спорт"]'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Записываем текущего пользователя на все мероприятия
INSERT INTO event_participants (event_id, user_id)
VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (event_id, user_id) DO NOTHING;