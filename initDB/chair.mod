set SESSIONS;
set CHAIRS;

param fit {SESSIONS, CHAIRS};

var SessionChair {CHAIRS, SESSIONS} binary;

maximize Total_Score: sum {i in CHAIRS, j in SESSIONS} fit[j,i] * SessionChair[i,j];

subject to max_one_chair_per_session {j in SESSIONS}: sum {i in CHAIRS} SessionChair[i,j] <= 1;

subject to max_one_session_per_chair {i in CHAIRS}: sum {j in SESSIONS} SessionChair[i,j] <= 1;

