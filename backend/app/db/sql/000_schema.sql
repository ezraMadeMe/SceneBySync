-- =============================================
-- SceneBySync — Core Schema Definition (DDL Only)
-- =============================================

-- 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- 1. users
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'writer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- 2. projects
-- =============================================
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active'
);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);

-- =============================================
-- 3. versions
-- =============================================
CREATE TABLE versions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    parent_version_id INTEGER REFERENCES versions(id),
    branch_name VARCHAR(100) DEFAULT 'main',
    commit_message TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_draft BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    total_scenes INTEGER DEFAULT 0,
    total_lines INTEGER DEFAULT 0,
    UNIQUE(project_id, version_number)
);
CREATE INDEX idx_versions_project ON versions(project_id);
CREATE INDEX idx_versions_parent ON versions(parent_version_id);
CREATE INDEX idx_versions_branch ON versions(branch_name);
CREATE INDEX idx_versions_created_at ON versions(created_at DESC);

-- =============================================
-- 4. version_tags
-- =============================================
CREATE TABLE version_tags (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_version_tags_version ON version_tags(version_id);

-- =============================================
-- 5. scenes
-- =============================================
CREATE TABLE scenes (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
    scene_number INTEGER NOT NULL,
    scene_header TEXT NOT NULL,
    location VARCHAR(255),
    time_of_day VARCHAR(50),
    order_index INTEGER NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    content_hash VARCHAR(64),
    duration_estimate INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(version_id, scene_number)
);
CREATE INDEX idx_scenes_version ON scenes(version_id);
CREATE INDEX idx_scenes_number ON scenes(scene_number);
CREATE INDEX idx_scenes_content_hash ON scenes(content_hash);
CREATE INDEX idx_scenes_location ON scenes(location);
CREATE INDEX idx_scenes_time ON scenes(time_of_day);

-- =============================================
-- 6. scene_lines
-- =============================================
CREATE TABLE scene_lines (
    id SERIAL PRIMARY KEY,
    scene_id INTEGER NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    global_line_number INTEGER NOT NULL,
    line_type VARCHAR(50),
    character_name VARCHAR(100),
    content TEXT NOT NULL,
    content_tsvector tsvector GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scene_id, line_number)
);
CREATE INDEX idx_scene_lines_scene ON scene_lines(scene_id);
CREATE INDEX idx_scene_lines_character ON scene_lines(character_name);
CREATE INDEX idx_scene_lines_type ON scene_lines(line_type);
CREATE INDEX idx_scene_lines_content_search ON scene_lines USING gin(content_tsvector);
CREATE INDEX idx_scene_lines_content_trigram ON scene_lines USING gin(content gin_trgm_ops);

-- =============================================
-- 7. scene_changes
-- =============================================
CREATE TABLE scene_changes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    from_version_id INTEGER REFERENCES versions(id),
    to_version_id INTEGER NOT NULL REFERENCES versions(id),
    scene_number INTEGER NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    old_scene_number INTEGER,
    new_scene_number INTEGER,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    lines_modified INTEGER DEFAULT 0,
    diff_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_scene_changes_project ON scene_changes(project_id);
CREATE INDEX idx_scene_changes_versions ON scene_changes(from_version_id, to_version_id);
CREATE INDEX idx_scene_changes_type ON scene_changes(change_type);

-- =============================================
-- 8. keywords
-- =============================================
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    keyword_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10B981',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, keyword_name)
);
CREATE INDEX idx_keywords_project ON keywords(project_id);
CREATE INDEX idx_keywords_name ON keywords(keyword_name);

-- =============================================
-- 9. keyword_scenes
-- =============================================
CREATE TABLE keyword_scenes (
    id SERIAL PRIMARY KEY,
    keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    scene_id INTEGER NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
    added_by INTEGER REFERENCES users(id),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(keyword_id, scene_id)
);
CREATE INDEX idx_keyword_scenes_keyword ON keyword_scenes(keyword_id);
CREATE INDEX idx_keyword_scenes_scene ON keyword_scenes(scene_id);
CREATE INDEX idx_keyword_scenes_version ON keyword_scenes(version_id);

-- =============================================
-- 10. comments
-- =============================================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
    scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
    line_id INTEGER REFERENCES scene_lines(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id),
    comment_text TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    parent_comment_id INTEGER REFERENCES comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_comments_version ON comments(version_id);
CREATE INDEX idx_comments_scene ON comments(scene_id);
CREATE INDEX idx_comments_line ON comments(line_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_resolved ON comments(is_resolved);

-- =============================================
-- 11. scene_embeddings
-- =============================================
CREATE TABLE scene_embeddings (
    id SERIAL PRIMARY KEY,
    scene_id INTEGER NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scene_id)
);
CREATE INDEX idx_scene_embeddings_vector ON scene_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- =============================================
-- 12. search_history
-- =============================================
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    search_query TEXT NOT NULL,
    search_type VARCHAR(50),
    results_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_project ON search_history(project_id);

-- =============================================
-- 13. version_references
-- =============================================
CREATE TABLE version_references (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
    reference_version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
    reference_type VARCHAR(50) DEFAULT 'reference',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(version_id, reference_version_id)
);
CREATE INDEX idx_version_references_version ON version_references(version_id);
CREATE INDEX idx_version_references_reference ON version_references(reference_version_id);

-- =============================================
-- 14. scene_copy_history
-- =============================================
CREATE TABLE scene_copy_history (
    id SERIAL PRIMARY KEY,
    target_version_id INTEGER NOT NULL REFERENCES versions(id),
    source_version_id INTEGER NOT NULL REFERENCES versions(id),
    source_scene_id INTEGER NOT NULL REFERENCES scenes(id),
    target_scene_id INTEGER REFERENCES scenes(id),
    copy_type VARCHAR(50) DEFAULT 'full',
    copied_lines JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_scene_copy_target ON scene_copy_history(target_version_id);
CREATE INDEX idx_scene_copy_source ON scene_copy_history(source_version_id);
