#!/bin/bash
sqlite3 mark_two_db.sqlt "CREATE TABLE Answers (contract TEXT NOT NULL, testee TEXT NOT NULL, answer TEXT, score INTEGER, scoreConfirmed INTEGER DEFAULT 1);"
sqlite3 mark_two_db.sqlt "CREATE TABLE Tasks (contract TEXT NOT NULL, owner TEXT NOT NULL, question TEXT NOT NULL, corrector TEXT NOT NULL, keyword TEXT NOT NULL, maxscore INTEGER NOT NULL, created_utc TEXT DEFAULT CURRENT_TIMESTAMP);"
sqlite3 mark_two_db.sqlt "CREATE TABLE TasksTransactions (hash TEXT NOT NULL, confirmed INTEGER DEFAULT 0);"