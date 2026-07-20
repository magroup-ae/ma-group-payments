#!/bin/bash
# MA Group — One-Click Label Printer setup (MUNBYN ITPP130). Safe to re-run.
set -e
SITE="https://ma-group-payments.netlify.app"
APPDIR="$HOME/Library/Application Support/MALabelPrint"
PLIST="$HOME/Library/LaunchAgents/com.magroup.labelprint.plist"
WATCH="$HOME/Downloads"
echo ""
echo "  MA GROUP — One-Click Label Printer Setup"
echo "  ----------------------------------------"
mkdir -p "$APPDIR" "$HOME/Library/LaunchAgents"

# 1) find the MUNBYN printer
P="$(lpstat -e 2>/dev/null | grep -iE 'itpp|munbyn|label' | head -1 || true)"
[ -z "$P" ] && P="$(lpstat -p 2>/dev/null | awk '/^printer/{print $2}' | grep -iE 'itpp|munbyn|label' | head -1 || true)"
[ -z "$P" ] && P="$(lpstat -p 2>/dev/null | awk '/^printer/{print $2}' | head -1 || true)"
if [ -z "$P" ]; then
  echo "  !! No printer found. Add the MUNBYN in System Settings > Printers, then re-run."
  exit 1
fi
echo "  Printer detected:  $P"

# 2) print-helper script
cat > "$APPDIR/print-watch.sh" <<EOF
#!/bin/bash
DIR="$WATCH"; PRINTER="$P"; LOG="$APPDIR/print.log"
cd "\$DIR" 2>/dev/null || exit 0
shopt -s nullglob
for f in malabel__*.pdf; do
  s1=\$(stat -f%z "\$f" 2>/dev/null || echo 0); sleep 1; s2=\$(stat -f%z "\$f" 2>/dev/null || echo 0)
  [ "\$s1" != "\$s2" ] && continue
  /usr/bin/lp -d "\$PRINTER" -o media=Custom.76.2x50.8mm "\$f" >>"\$LOG" 2>&1 && echo "\$(date '+%F %T') printed \$f" >>"\$LOG" || echo "\$(date '+%F %T') ERROR \$f" >>"\$LOG"
  rm -f "\$f"
done
EOF
chmod +x "$APPDIR/print-watch.sh"

# 3) background watcher
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
 <key>Label</key><string>com.magroup.labelprint</string>
 <key>ProgramArguments</key><array><string>/bin/bash</string><string>$APPDIR/print-watch.sh</string></array>
 <key>WatchPaths</key><array><string>$WATCH</string></array>
 <key>RunAtLoad</key><true/>
</dict></plist>
EOF
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "  Background print helper installed & running."

# 4) test print
curl -fsSL "$SITE/malabel_test.pdf" -o "$APPDIR/malabel_test.pdf" || { echo "  !! Could not download test label"; exit 1; }
/usr/bin/lp -d "$P" -o media=Custom.76.2x50.8mm "$APPDIR/malabel_test.pdf" >/dev/null 2>&1 && echo "  >> TEST label sent to $P — check the printer." || echo "  !! test print failed"
echo ""
echo "  DONE. Files named malabel__*.pdf in Downloads now auto-print to $P."
echo ""
