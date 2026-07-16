export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const searchTerm =
      typeof body.searchTerm === "string"
        ? body.searchTerm.trim()
        : "";

    if (
      !searchTerm ||
      searchTerm.length > 50
    ) {
      return Response.json(
        {
          success: false,
          message: "無効な検索語です。"
        },
        { status: 400 }
      );
    }

    await context.env.DB.prepare(`
      INSERT INTO missing_station_searches (
        search_term,
        search_count,
        updated_at
      )
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(search_term)
      DO UPDATE SET
        search_count = search_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(searchTerm)
      .run();

    return Response.json({
      success: true
    });
  } catch (error) {
    console.error("未登録駅検索の記録に失敗しました。", error);

    return Response.json(
      {
        success: false,
        message: "検索語を記録できませんでした。"
      },
      { status: 500 }
    );
  }
}