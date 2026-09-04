// Scheduled marketing publisher: every 15 minutes ask the API to push any post
// whose scheduled time has passed. The API does the work (same code path as the
// "Publish now" button) so there is exactly one publishing implementation.
var config = { schedule: "*/15 * * * *" };
var cron_mkt_default = async () => {
  const key = process.env.CRON_KEY || "";
  const base = (process.env.SITE_URL || process.env.URL || "https://system.maagroup.ae").replace(/\/+$/, "");
  if (!key) return new Response(JSON.stringify({ skipped: "CRON_KEY not set" }), { headers: { "content-type": "application/json" } });
  try {
    const rs = await fetch(base + "/api/mkt/run-scheduled", { headers: { "x-cron-key": key } });
    const txt = await rs.text();
    return new Response(txt, { status: rs.status, headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e && e.message || e) }), { status: 500 });
  }
};
export { config, cron_mkt_default as default };
