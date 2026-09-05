// Weekly minutes digest: every Monday 08:00 Dubai (04:00 UTC) e-mail the open
// meeting actions by project to the staff distribution list. The API composes and
// sends it (same list and mail settings as issuing minutes).
var config = { schedule: "0 4 * * 1" };
var cron_mom_default = async () => {
  const key = process.env.CRON_KEY || "";
  const base = (process.env.SITE_URL || process.env.URL || "https://system.maagroup.ae").replace(/\/+$/, "");
  if (!key) return new Response(JSON.stringify({ skipped: "CRON_KEY not set" }), { headers: { "content-type": "application/json" } });
  try {
    const rs = await fetch(base + "/api/mom/weekly-digest", { headers: { "x-cron-key": key } });
    const txt = await rs.text();
    return new Response(txt, { status: rs.status, headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e && e.message || e) }), { status: 500 });
  }
};
export { config, cron_mom_default as default };
