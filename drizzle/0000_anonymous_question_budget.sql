CREATE TABLE `ai_question_reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_hash` text NOT NULL,
	`day` integer NOT NULL,
	`minute` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_reservations_day` ON `ai_question_reservations` (`day`);--> statement-breakpoint
CREATE INDEX `ai_reservations_visitor_day` ON `ai_question_reservations` (`visitor_hash`,`day`);--> statement-breakpoint
CREATE INDEX `ai_reservations_visitor_minute` ON `ai_question_reservations` (`visitor_hash`,`minute`);