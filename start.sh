cd backend || { echo ':    '; exit 1; }
node server.js &

BACKEND_PID=$!

cd ../frontend/digital-wild || { echo ':    '; exit 1; }
npm run dev -- --host

kill $BACKEND_PID
