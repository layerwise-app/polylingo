CREATE TABLE `daily_activity` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `daily_activity_pk` PRIMARY KEY(`user_id`, `date`),
	CONSTRAINT `fk_daily_activity_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `learner_profile` (
	`user_id` text PRIMARY KEY,
	`xp` integer DEFAULT 0 NOT NULL,
	`hearts` integer DEFAULT 5 NOT NULL,
	`hearts_anchor_ms` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	`daily_goal` integer DEFAULT 20 NOT NULL,
	`time_zone` text DEFAULT 'UTC' NOT NULL,
	`sound_enabled` integer DEFAULT true NOT NULL,
	`show_on_leaderboard` integer DEFAULT true NOT NULL,
	`perfect_lessons` integer DEFAULT 0 NOT NULL,
	`practice_sessions` integer DEFAULT 0 NOT NULL,
	`mistakes_fixed` integer DEFAULT 0 NOT NULL,
	`daily_goals_hit` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_learner_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `lesson_attempt` (
	`id` text PRIMARY KEY,
	`user_id` text,
	`guest_token` text,
	`kind` text NOT NULL,
	`lesson_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`queue` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`total_exercises` integer NOT NULL,
	`missed_ids` text NOT NULL,
	`guest_hearts` integer,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`accuracy` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	CONSTRAINT `fk_lesson_attempt_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`times_completed` integer DEFAULT 1 NOT NULL,
	`best_accuracy` integer DEFAULT 0 NOT NULL,
	`first_completed_at` integer NOT NULL,
	CONSTRAINT `lesson_progress_pk` PRIMARY KEY(`user_id`, `lesson_id`),
	CONSTRAINT `fk_lesson_progress_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `mistake` (
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`times_wrong` integer DEFAULT 1 NOT NULL,
	`last_wrong_at` integer NOT NULL,
	`resolved_at` integer,
	CONSTRAINT `mistake_pk` PRIMARY KEY(`user_id`, `exercise_id`),
	CONSTRAINT `fk_mistake_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `user_achievement` (
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` integer NOT NULL,
	CONSTRAINT `user_achievement_pk` PRIMARY KEY(`user_id`, `achievement_id`),
	CONSTRAINT `fk_user_achievement_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `weekly_xp` (
	`week_start` text NOT NULL,
	`user_id` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `weekly_xp_pk` PRIMARY KEY(`week_start`, `user_id`),
	CONSTRAINT `fk_weekly_xp_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `lesson_attempt_guest_idx` ON `lesson_attempt` (`guest_token`);--> statement-breakpoint
CREATE INDEX `lesson_attempt_user_idx` ON `lesson_attempt` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_attempt_active_user_idx` ON `lesson_attempt` (`user_id`,`lesson_id`) WHERE "lesson_attempt"."status" = 'active' and "lesson_attempt"."user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_attempt_active_guest_idx` ON `lesson_attempt` (`guest_token`,`lesson_id`) WHERE "lesson_attempt"."status" = 'active' and "lesson_attempt"."guest_token" is not null;--> statement-breakpoint
CREATE INDEX `weekly_xp_rank_idx` ON `weekly_xp` (`week_start`,`xp`);