const ALLOWED_LINE_IDS = new Set([
  "tobu-urbanpark",
  "saikyo",
  "shonan-shinjuku",
  "jr-chuo",
  "joban"
]);

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const lineId = typeof body.lineId === "string" ? body.lineId.trim() : "";

    if (!ALLOWED_LINE_IDS.has(lineId)) {
      return Response.json(
        { success: false, message: "無効な路線です。" },
        { status: 400 }
      );
    }

    await context.env.DB.prepare(`
      INSERT INTO line_filter_usage (
        line_id,
        usage_count,
        updated_at
      )
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(line_id)
      DO UPDATE SET
        usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(lineId)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    console.error("路線フィルターの記録に失敗しました。", error);

    return Response.json(
      { success: false, message: "記録に失敗しました。" },
      { status: 500 }
    );
  }
}
