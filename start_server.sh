#!/bin/bash
# =======================================================
# Start Server Script for SmoothMorph (morph.miosmooth.com)
# =======================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

echo "🚀 Initializing SmoothMorph Server..."

# 1. Check if dist directory exists, if not build it
if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo "📦 Building Production Assets..."
    npm run build
fi

# 2. Stop any existing process running on port 3000
PID=$(lsof -t -i:3000 2>/dev/null)
if [ -n "$PID" ]; then
    echo "🔄 Stopping existing process on port 3000 (PID: $PID)..."
    kill -9 $PID 2>/dev/null
fi

# 3. Start Node.js static server in background
echo "🌐 Starting Node.js Static Server on port 3000..."
nohup node "$PROJECT_DIR/server.js" > "$PROJECT_DIR/server.log" 2>&1 &

# 4. Wait a moment for server initialization
sleep 2

# 5. Verify server status
if curl -s http://127.0.0.1:3000 > /dev/null; then
    echo "✅ Node Server is RUNNING at http://127.0.0.1:3000"
else
    echo "❌ Failed to start Node Server. Check server.log for details."
    exit 1
fi

# Note: Cloudflare Tunnel runs independently as a central service.

echo "======================================================="
echo "🎉 SmoothMorph is LIVE!"
echo "   - Local URL  : http://localhost:3000"
echo "   - Public URL : https://morph.miosmooth.com"
echo "======================================================="
