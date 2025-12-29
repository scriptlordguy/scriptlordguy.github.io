#!/usr/bin/env bash#!/usr/bin/env bash#!/usr/bin/env bash




























echo "SMOKE OK"echo "Upload:"; echo "$UP" | jq '.'UP=$(curl -s -X POST -H "Authorization: Bearer $TOK1" -F "file=@../assets/favicon.svg" $BASE/api/upload)echo "Friend request:"; echo "$FR" | jq '.'FR=$(curl -s -X POST $BASE/api/friends/request -H "Authorization: Bearer $TOK1" -H "Content-Type: application/json" -d '{"userId":"'$F2ID'"}')F2ID=$(echo "$R2" | jq -r '.user.id')echo "Create server:"; echo "$CREATE" | jq '.'CREATE=$(curl -s -X POST $BASE/api/servers -H "Authorization: Bearer $TOK1" -H "Content-Type: application/json" -d '{"name":"smoke-server"}')echo "Get /api/me:"; echo "$ME" | jq '.'ME=$(curl -s -X GET $BASE/api/me -H "Authorization: Bearer $TOK1")echo "Signup 2:"; echo "$R2" | jq '.'TOK2=$(echo "$R2" | jq -r .token)R2=$(curl -s -X POST $BASE/api/signup -H "Content-Type: application/json" -d '{"username":"smoket2","email":"smoket2@example.com","password":"pass1234","phone":"+222"}')echo "Signup 1:"; echo "$R1" | jq '.'TOK1=$(echo "$R1" | jq -r .token)R1=$(curl -s -X POST $BASE/api/signup -H "Content-Type: application/json" -d '{"username":"smoket1","email":"smoket1@example.com","password":"pass1234","phone":"+111"}')echo "Smoke tests against $BASE"BASE=${BASE:-http://localhost:8080}set -euo pipefail



























echo "SMOKE OK"echo "Upload:"; echo "$UP" | jq '.'UP=$(curl -s -X POST -H "Authorization: Bearer $TOK1" -F "file=@../assets/favicon.svg" $BASE/api/upload)echo "Friend request:"; echo "$FR" | jq '.'FR=$(curl -s -X POST $BASE/api/friends/request -H "Authorization: Bearer $TOK1" -H "Content-Type: application/json" -d '{"userId":"'$F2ID'"}')F2ID=$(echo "$R2" | jq -r '.user.id')echo "Create server:"; echo "$CREATE" | jq '.'CREATE=$(curl -s -X POST $BASE/api/servers -H "Authorization: Bearer $TOK1" -H "Content-Type: application/json" -d '{"name":"smoke-server"}')echo "Get /api/me:"; echo "$ME" | jq '.'ME=$(curl -s -X GET $BASE/api/me -H "Authorization: Bearer $TOK1")echo "Signup 2:"; echo "$R2" | jq '.'TOK2=$(echo "$R2" | jq -r .token)R2=$(curl -s -X POST $BASE/api/signup -H "Content-Type: application/json" -d '{"username":"smoket2","email":"smoket2@example.com","password":"pass1234","phone":"+222"}')echo "Signup 1:"; echo "$R1" | jq '.'TOK1=$(echo "$R1" | jq -r .token)R1=$(curl -s -X POST $BASE/api/signup -H "Content-Type: application/json" -d '{"username":"smoket1","email":"smoket1@example.com","password":"pass1234","phone":"+111"}')echo "Smoke tests against $BASE"BASE=${BASE:-http://localhost:8080}set -euo pipefailset -euo pipefail
BASE=${BASE:-http://localhost:8080}

echo "Smoke tests against $BASE"

R1=$(curl -s -X POST $BASE/api/signup -H "Content-Type: application/json" -d '{"username":"smoket1","email":"smoket1@example.com","password":"pass1234","phone":"+111"}')
TOK1=$(echo "$R1" | jq -r .token)
echo "Signup 1:"; echo "$R1" | jq '.'

R2=$(curl -s -X POST $BASE/api/signup -H "Content-Type: application/json" -d '{"username":"smoket2","email":"smoket2@example.com","password":"pass1234","phone":"+222"}')
TOK2=$(echo "$R2" | jq -r .token)
echo "Signup 2:"; echo "$R2" | jq '.'

ME=$(curl -s -X GET $BASE/api/me -H "Authorization: Bearer $TOK1")
echo "Get /api/me:"; echo "$ME" | jq '.'

CREATE=$(curl -s -X POST $BASE/api/servers -H "Authorization: Bearer $TOK1" -H "Content-Type: application/json" -d '{"name":"smoke-server"}')
echo "Create server:"; echo "$CREATE" | jq '.'

F2ID=$(echo "$R2" | jq -r '.user.id')
FR=$(curl -s -X POST $BASE/api/friends/request -H "Authorization: Bearer $TOK1" -H "Content-Type: application/json" -d '{"userId":"'$F2ID'"}')
echo "Friend request:"; echo "$FR" | jq '.'

UP=$(curl -s -X POST -H "Authorization: Bearer $TOK1" -F "file=@../assets/favicon.svg" $BASE/api/upload)
echo "Upload:"; echo "$UP" | jq '.'

echo "SMOKE OK"
