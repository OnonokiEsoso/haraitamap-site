import { ALLOWED_STATION_NAMES } from "../_shared/stations.js";

const canonicalStationName = (name) =>
  name.replace(/\s+/g, "").replace(/駅$/, "");

const STATION_NAME_MAP = new Map(
  ALLOWED_STATION_NAMES.map((name) => [canonicalStationName(name), name])
);

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const requestedStationName =
      typeof body.stationName === "string"
        ? body.stationName.trim()
        : "";
    const stationName = STATION_NAME_MAP.get(
      canonicalStationName(requestedStationName)
    );

    if (!stationName) {
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
