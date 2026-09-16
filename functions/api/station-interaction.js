const VALID_EVENT_TYPES = new Set([
  "candidate_click",
  "sort_change",
  "report_click",
  "entry_source",
  "feedback_location_unclear"
]);

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const stationPath = typeof body.stationPath === "string" ? body.stationPath.trim() : "";
    const stationName = typeof body.stationName === "string" ? body.stationName.trim() : "";
    const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
    const eventValue = typeof body.eventValue === "string" ? body.eventValue.trim().slice(0, 120) : "";

    const validPath = /^\/stations\/[a-z0-9-]+(?:\.html)?$/i;
    if (!validPath.test(stationPath) || !stationName || stationName.length > 50 || !VALID_EVENT_TYPES.has(eventType)) {
      return Response.json({ success: false, message: "無効な集計内容です。" }, { status: 400 });
    }

    await context.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS station_interactions (
        station_path TEXT NOT NULL,
        station_name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_value TEXT NOT NULL DEFAULT '',
        usage_count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (station_path, event_type, event_value)
      )
    `).run();

    await context.env.DB.prepare(`
      INSERT INTO station_interactions (
        station_path,
        station_name,
        event_type,
        event_value,
        usage_count,
        updated_at
      ) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(station_path, event_type, event_value)
      DO UPDATE SET
        station_name = excluded.station_name,
        usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(stationPath, stationName, eventType, eventValue)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    console.error("駅ページ行動の記録に失敗しました。", error);
    return Response.json({ success: false, message: "行動を記録できませんでした。" }, { status: 500 });
  }
}
