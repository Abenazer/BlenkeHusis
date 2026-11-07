---
name: no-live-display
enabled: true
event: bash
pattern: DISPLAY=["']?:0(?![\d])|^(?![\s\S]*--headless)(?![\s\S]*DISPLAY=["']?:[1-9])[\s\S]*((^|[;&|(\n]|\$\()\s*(\w+=\S*\s+)*((timeout(\s+-\S+(\s+[\d.]+[smhd]?)?)*\s+\S+|nohup|exec|env|setsid|command)\s+)*(\S*/)?(chromium|chromium-browser|google-chrome|firefox)(?=\s|$)[^\n]*(https?://|file://|\.html)|\bxdg-open\b|(^|[;&|(\n]|\$\()\s*(\w+=\S*\s+)*(xdotool|xwd|scrot)\b|\bimport\s+-window)
action: block
---

🛑 **Blocked: this would run on the user's live desktop (`:0`)**

The shell's default `DISPLAY` is `:0`, the user's real session. A browser
window there grabs their keyboard/mouse, and xdotool there types and clicks on
their actual desktop.

- Use `chromium --headless` when you only need a screenshot or the DOM.
- Otherwise use the virtual display: `Xvfb :99 -screen 0 1920x1080x24 &`, then
  `DISPLAY=:99 chromium --user-data-dir=<scratch profile> <url>`.
- Close the browser gracefully, never `kill -9`.
