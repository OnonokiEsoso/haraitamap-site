const ALLOWED_STATIONS = new Set([
  "東京駅",
  "大宮",
  "北大宮",
  "大宮公園",
  "大和田",
  "七里",
  "岩槻",
  "春日部",
  "北与野",
  "与野本町",
  "南与野",
  "武蔵浦和",
  "中浦和",
  "北戸田",
  "戸田",
  "戸田公園",
  "浮間舟渡",
  "北赤羽",
  "赤羽",
  "十条",
  "板橋",
  "池袋",
  "浦和",
  "新宿",
  "渋谷",
  "恵比寿",
  "大崎",
  "西大井",
  "武蔵小杉",
  "新川崎",
  "横浜",
  "保土ケ谷",
  "東戸塚",
  "戸塚",
  "大船",
  "北鎌倉",
  "鎌倉",
  "名古屋駅",
  "品川駅",
  "新橋駅",
  "上野駅",
  "綾瀬駅",
  "柏駅"
]);

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const stationName =
      typeof body.stationName === "string"
        ? body.stationName.trim()
        : "";

    if (!stationName || !ALLOWED_STATIONS.has(stationName)) {
      return Response.json(
        { success: false, message: "無効な駅名です。" },
        { status: 400 }
      );
    }

    await context.env.DB.prepare(`
      INSERT INTO station_searches (
        station_name,
        search_count,
        updated_at
      )
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(station_name)
      DO UPDATE SET
        search_count = search_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(stationName)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: "記録に失敗しました。" },
      { status: 500 }
    );
  }
}