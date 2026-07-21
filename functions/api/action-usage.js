const ALLOWED_ACTIONS = new Set([
  "sort:recommended",
  "sort:cleanliness",
  "sort:congestion",
  "sort:newness",
  "emergency:clicked",
  "distraction:clicked",
  "distraction:page_view"
]);

const jsonResponse = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });

export async function onRequestPost(context) {
  let body;

  try {
    body = await context.request.json();
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "JSON形式のリクエストを送信してください。"
      },
      400
    );
  }

  const actionName =
    typeof body.action_name === "string"
      ? body.action_name.trim()
      : "";

  if (!ALLOWED_ACTIONS.has(actionName)) {
    return jsonResponse(
      {
        success: false,
        message: "無効な行動名です。"
      },
      400
    );
  }

  try {
    await context.env.DB.prepare(`
      INSERT INTO site_action_usage (
        action_name,
        usage_count,
        updated_at
      )
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(action_name)
      DO UPDATE SET
        usage_count = site_action_usage.usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(actionName)
      .run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("行動回数の記録に失敗しました。", error);

    return jsonResponse(
      {
        success: false,
        message: "行動回数を記録できませんでした。"
      },
      500
    );
  }
}
