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

    const feedbackType =
      typeof body.feedbackType === "string"
        ? body.feedbackType.trim()
        : "";

    const validPath = /^\/stations\/[a-z0-9-]+(?:\.html)?$/i;
    const validFeedbackTypes = new Set([
      "helpful",
      "outdated"
    ]);

    if (
      !validPath.test(stationPath) ||
      !stationName ||
      stationName.length > 50 ||
      !validFeedbackTypes.has(feedbackType)
    ) {
      return Response.json(
        {
          success: false,
          message: "無効な評価内容です。"
        },
        { status: 400 }
      );
    }

    if (feedbackType === "helpful") {
      await context.env.DB.prepare(`
        INSERT INTO station_feedback (
          station_path,
          station_name,
          helpful_count,
          outdated_count,
          updated_at
        )
        VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP)
        ON CONFLICT(station_path)
        DO UPDATE SET
          station_name = excluded.station_name,
          helpful_count = helpful_count + 1,
          updated_at = CURRENT_TIMESTAMP
      `)
        .bind(stationPath, stationName)
        .run();
    } else {
      await context.env.DB.prepare(`
        INSERT INTO station_feedback (
          station_path,
          station_name,
          helpful_count,
          outdated_count,
          updated_at
        )
        VALUES (?, ?, 0, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(station_path)
        DO UPDATE SET
          station_name = excluded.station_name,
          outdated_count = outdated_count + 1,
          updated_at = CURRENT_TIMESTAMP
      `)
        .bind(stationPath, stationName)
        .run();
    }

    return Response.json({
      success: true
    });
  } catch (error) {
    console.error("駅情報評価の記録に失敗しました。", error);

    return Response.json(
      {
        success: false,
        message: "評価を記録できませんでした。"
      },
      { status: 500 }
    );
  }
}