CREATE TABLE `jobs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `company` text NOT NULL,
  `role` text NOT NULL,
  `city` text DEFAULT '' NOT NULL,
  `status` text DEFAULT '想投' NOT NULL,
  `salary` text DEFAULT '' NOT NULL,
  `source` text DEFAULT '' NOT NULL,
  `jd` text DEFAULT '' NOT NULL,
  `tags` text DEFAULT '[]' NOT NULL,
  `match_score` integer DEFAULT 70 NOT NULL,
  `next_action` text DEFAULT '' NOT NULL,
  `notes` text DEFAULT '' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE `interviews` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `job_id` integer,
  `company` text DEFAULT '' NOT NULL,
  `round` text DEFAULT '一面' NOT NULL,
  `question` text NOT NULL,
  `answer` text DEFAULT '' NOT NULL,
  `reflection` text DEFAULT '' NOT NULL,
  `result` text DEFAULT '待复盘' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE cascade
);
