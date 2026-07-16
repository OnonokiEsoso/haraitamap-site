const ALLOWED_LINES = {
  jr: "JR",
  metro: "東京メトロ",
  private: "私鉄",
  "tobu-urbanpark": "東武アーバンパークライン",
  saikyo: "埼京線",
  "shonan-shinjuku": "湘南新宿ライン",
  "jr-chuo": "JR 中央本線",
  joban: "常磐線"
};

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const lineId =
      typeof body.lineId === "string"
        ? body.lineId.trim()
        : "";

    const lineName = ALLOWED_LINES[lineId];

    if (!lineId || !lineName) {
      return Response.json(
        {
          success: false,
          message: "無効な路線です。"
        },
        { status: 400 }
      );
    }

    await context.env.DB.prepare(`
      INSERT INTO line_filter_usage (
        line_id,
        line_name,
        usage_count,
        updated_at
      )
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(line_id)
      DO UPDATE SET
        line_name = excluded.line_name,
        usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(lineId, lineName)
      .run();

    return Response.json({
      success: true
    });
  } catch (error) {
    console.error("路線フィルターの記録に失敗しました。", error);

    return Response.json(
      {
        success: false,
        message: "路線の利用回数を記録できませんでした。"
      },
      { status: 500 }
    );
  }
}