#!/bin/bash
rm mark_two_db.sqlt
sqlite3 mark_two_db.sqlt "CREATE TABLE Answers (
	contract TEXT NOT NULL,
	testee TEXT NOT NULL,
	answer TEXT,
	score INTEGER,
	score_confirmed INTEGER DEFAULT 1);"
sqlite3 mark_two_db.sqlt "CREATE TABLE Tasks (
	contract TEXT NOT NULL,
	owner TEXT NOT NULL,
	question TEXT NOT NULL,
	corrector TEXT NOT NULL,
	keyword TEXT NOT NULL,
	maxscore INTEGER NOT NULL,
	created_utc TEXT DEFAULT CURRENT_TIMESTAMP,
	end_utc TEXT NOT NULL,
	token_address TEXT NOT NULL,
	token_amount INTEGER,
	token_confirmed INTEGER DEFAULT 1,
	state TEXT DEFAULT \"o\");"
	# state is enum with 4 possible values:
	# - o  = online
	# - op = online and incentiviced (payed)
	# - f  = finished (now > end_utc)
	# - fp = finished and payed out (reward payed out to corrector)
sqlite3 mark_two_db.sqlt "CREATE TABLE TasksTransactions (
	hash TEXT NOT NULL,
	confirmed INTEGER DEFAULT 0);"