export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const stationPath = typeof body.stationPath === "string" ? body.stationPath.trim().replace(/\.html$/i, "") : "";
    const stationName = typeof body.stationName === "string" ? body.stationName.trim() : "";
    const secondsRaw = Number(body.activeSeconds);
    const activeSeconds = Number.isFinite(secondsRaw)
      ? Math.max(0, Math.min(1800, Math.round(secondsRaw)))
      : -1;

    const validPath = /^\/stations\/[a-z0-9-]+$/i;
    if (!validPath.test(stationPath) || !stationName || stationName.length > 50 || activeSeconds < 0) {
      return Response.json({ success: false, message: "無効な滞在時間です。" }, { status: 400 });
    }

    const bucket =
      activeSeconds <= 10 ? "0_10" :
      activeSeconds <= 30 ? "11_30" :
      activeSeconds <= 60 ? "31_60" :
      activeSeconds <= 120 ? "61_120" :
      "121_plus";

    await context.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS station_engagement (
        station_path TEXT PRIMARY KEY,
        station_name TEXT NOT NULL,
        total_active_seconds INTEGER NOT NULL DEFAULT 0,
        measured_views INTEGER NOT NULL DEFAULT 0,
        quick_exit_count INTEGER NOT NULL DEFAULT 0,
        long_view_count INTEGER NOT NULL DEFAULT 0,
        bucket_0_10 INTEGER NOT NULL DEFAULT 0,
        bucket_11_30 INTEGER NOT NULL DEFAULT 0,
        bucket_31_60 INTEGER NOT NULL DEFAULT 0,
        bucket_61_120 INTEGER NOT NULL DEFAULT 0,
        bucket_121_plus INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      )
    `).run();

    const bucketColumn = {
      "0_10": "bucket_0_10",
      "11_30": "bucket_11_30",
      "31_60": "bucket_31_60",
      "61_120": "bucket_61_120",
      "121_plus": "bucket_121_plus"
    }[bucket];

    const quick = activeSeconds <= 10 ? 1 : 0;
    const long = activeSeconds >= 60 ? 1 : 0;

    await context.env.DB.prepare(`
      INSERT INTO station_engagement (
        station_path,
        station_name,
        total_active_seconds,
        measured_views,
        quick_exit_count,
        long_view_count,
        ${bucketColumn},
        updated_at
      ) VALUES (?, ?, ?, 1, ?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(station_path)
      DO UPDATE SET
        station_name = excluded.station_name,
        total_active_seconds = total_active_seconds + excluded.total_active_seconds,
        measured_views = measured_views + 1,
        quick_exit_count = quick_exit_count + excluded.quick_exit_count,
        long_view_count = long_view_count + excluded.long_view_count,
        ${bucketColumn} = ${bucketColumn} + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(stationPath, stationName, activeSeconds, quick, long)
      .run();

    return Response.json({ success: true, bucket });
  } catch (error) {
    console.error("駅ページ滞在時間の記録に失敗しました。", error);
    return Response.json({ success: false, message: "滞在時間を記録できませんでした。" }, { status: 500 });
  }
}
