CREATE TABLE `workspaces` (
	`owner` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL
);
