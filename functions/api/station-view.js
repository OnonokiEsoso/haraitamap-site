export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const stationPath =
      typeof body.stationPath === "string"
        ? body.stationPath.trim()
        : "";

    const stationName =
      typeof body.stationName === "string"
        ? body.stationName.trim()
        : "";

    const validPath = /^\/stations\/[a-z0-9-]+\.html$/i;

    if (
      !validPath.test(stationPath) ||
      !stationName ||
      stationName.length > 50
    ) {
      return Response.json(
        {
          success: false,
          message: "無効な駅ページです。"
        },
        { status: 400 }
      );
    }

    await context.env.DB.prepare(`
      INSERT INTO station_views (
        station_path,
        station_name,
        view_count,
        updated_at
      )
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(station_path)
      DO UPDATE SET
        station_name = excluded.station_name,
        view_count = view_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(stationPath, stationName)
      .run();

    return Response.json({
      success: true
    });
  } catch (error) {
    console.error("駅閲覧数の記録に失敗しました。", error);

    return Response.json(
      {
        success: false,
        message: "閲覧数を記録できませんでした。"
      },
      { status: 500 }
    );
  }
}