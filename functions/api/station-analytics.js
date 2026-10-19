const VALID_EVENTS = new Set(["start", "update", "end"]);
const VALID_NEXT_PAGES = new Set(["internal", "external", "unknown"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATION_PATTERN = /^\/stations\/[a-z0-9-]+$/i;

function invalid(message) {
  return Response.json({ success: false, message }, { status: 400 });
}

export async function onRequestPost(context) {
  try {
    const request = context.request;
    if (Number(request.headers.get("content-length") || 0) > 4096) {
      return invalid("送信データが大きすぎます。");
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return invalid("無効なデータです。");
    }

    const {
      eventType, visitId, sessionId, stationPath, stationName,
      maxScrollPercent, activeSeconds, nextPageType
    } = body;

    if (
      !VALID_EVENTS.has(eventType) ||
      typeof visitId !== "string" || !UUID_PATTERN.test(visitId) ||
      typeof sessionId !== "string" || !UUID_PATTERN.test(sessionId) ||
      typeof stationPath !== "string" || !STATION_PATTERN.test(stationPath) ||
      typeof stationName !== "string" ||
      !stationName.trim() || stationName.length > 50 ||
      !Number.isInteger(maxScrollPercent) ||
      maxScrollPercent < 0 || maxScrollPercent > 100 ||
      !Number.isInteger(activeSeconds) ||
      activeSeconds < 0 || activeSeconds > 1800 ||
      !VALID_NEXT_PAGES.has(nextPageType)
    ) {
      return invalid("計測内容を確認してください。");
    }

    const db = context.env.DB;
    if (!db) {
      return Response.json(
        { success: false, message: "DBが設定されていません。" },
        { status: 500 }
      );
    }

    // update/endが先着した場合も閲覧を1回だけ作成する。
    // 後着のstartでも日時が上書きされないようにする。
    await db.prepare(`
      INSERT INTO station_analytics_visits
        (visit_id, session_id, station_path, station_name,
         max_scroll_percent, active_seconds, next_page_type, completed)
      VALUES (?, ?, ?, ?, ?, ?, 'unknown', 0)
      ON CONFLICT(visit_id) DO NOTHING
    `).bind(
      visitId, sessionId, stationPath, stationName,
      maxScrollPercent, activeSeconds
    ).run();

    // 対応する閲覧IDのレコードだけ更新する。
    // 終了後に遅れて到着したupdate/startで確定値を壊さない。
    // 更新値は最大値を採用し、ネットワーク順序の入れ替わりに耐える。
    await db.prepare(`
      UPDATE station_analytics_visits
      SET
        last_seen_at = CURRENT_TIMESTAMP,
        max_scroll_percent = MAX(
          COALESCE(max_scroll_percent, 0), ?
        ),
        active_seconds = MAX(
          COALESCE(active_seconds, 0), ?
        ),
        next_page_type = CASE
          WHEN ? = 'end' THEN ?
          ELSE next_page_type
        END,
        completed = CASE
          WHEN ? = 'end' THEN 1
          ELSE completed
        END,
        exit_status = CASE
          WHEN ? = 'end' AND ? = 'internal' THEN 0
          WHEN ? = 'end' AND ? = 'external' THEN 1
          ELSE exit_status
        END
      WHERE visit_id = ?
        AND session_id = ?
        AND station_path = ?
        AND completed = 0
    `).bind(
      maxScrollPercent, activeSeconds,
      eventType, nextPageType,
      eventType,
      eventType, nextPageType,
      eventType, nextPageType,
      visitId, sessionId, stationPath
    ).run();

    return Response.json({ success: true });
  } catch (error) {
    console.error("駅アクセス解析の記録に失敗しました。", error);
    return Response.json(
      { success: false, message: "計測データを記録できませんでした。" },
      { status: 500 }
    );
  }
}
