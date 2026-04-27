CREATE DATABASE IF NOT EXISTS dongman_bizhi
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dongman_bizhi;

CREATE TABLE IF NOT EXISTS anime_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_anime_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallpapers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  oss_object_key VARCHAR(500) NOT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_wallpapers_category_id (category_id),
  KEY idx_wallpapers_featured_created_at (is_featured, created_at),
  KEY idx_wallpapers_category_created_at (category_id, created_at),
  CONSTRAINT fk_wallpapers_category
    FOREIGN KEY (category_id)
    REFERENCES anime_categories (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
