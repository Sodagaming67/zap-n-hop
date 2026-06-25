Start the local development server for this Phaser game project. Follow these steps in order using Bash:

1. Kill any process already listening on port 8080:
   ```
   PID=$(netstat -ano 2>/dev/null | grep ":8080 " | grep "LISTENING" | awk '{print $5}' | head -1) && [ -n "$PID" ] && taskkill //F //PID $PID 2>/dev/null; true
   ```

2. Wait 1 second for the port to free up.

3. Start a Python HTTP server in the background from the project root:
   ```
   cd "c:/Code/Games/zap-n-hop" && python -m http.server 8080 &
   ```

4. Wait 1 second for the server to start up.

5. Open the game in the default browser:
   ```
   cmd.exe /c start http://localhost:8080
   ```

6. Tell the user: "Server is running at http://localhost:8080 — open your browser if it didn't open automatically."

If Python is not found in step 3, try `python3 -m http.server 8080 &` instead.
