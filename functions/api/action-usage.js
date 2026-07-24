const ALLOWED_ACTIONS = new Set([
  "emergency:clicked",
  "distraction:clicked"
]);

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const actionName =
      typeof body.actionName === "string" ? body.actionName.trim() : "";

    if (!ALLOWED_ACTIONS.has(actionName)) {
      return Response.json(
        { success: false, message: "無効な操作です。" },
        { status: 400 }
      );
    }

    await context.env.DB.prepare(`
      INSERT INTO site_action_usage (
        action_name,
        usage_count,
        updated_at
      )
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(action_name)
      DO UPDATE SET
        usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(actionName)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    console.error("行動集計の記録に失敗しました。", error);

    return Response.json(
      { success: false, message: "記録に失敗しました。" },
      { status: 500 }
    );
  }
}
