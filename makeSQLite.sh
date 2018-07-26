#!/bin/bash
sqlite3 mark_two_db.sqlt "CREATE TABLE Testees (contract TEXT NOT NULL, testee TEXT NOT NULL);"
sqlite3 mark_two_db.sqlt "CREATE TABLE Tasks (contract TEXT NOT NULL, owner TEXT NOT NULL, question TEXT NOT NULL, corrector TEXT NOT NULL, maxscore INTEGER NOT NULL);"