export async function onRequestGet(context) {
  try {
    const result = await context.env.DB.prepare(`
      SELECT station_name, search_count
      FROM station_searches
      ORDER BY search_count DESC, updated_at DESC
      LIMIT 8
    `).all();

    return Response.json({
      success: true,
      stations: result.results ?? []
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        stations: [],
        message: "人気駅を取得できませんでした。"
      },
      { status: 500 }
    );
  }
}