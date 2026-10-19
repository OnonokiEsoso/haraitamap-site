const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PATH = /^\/articles\/[a-z0-9-]{1,90}$/;
const EVENTS = new Set(['start','update','end','click']);
const SOURCE = new Set(['guide_home','other_article','station_map','search','external','direct_or_unknown']);
const NEXT = new Set(['guide_home','other_article','station_map','other_internal','external','unknown']);
const LINKS = new Set(['guide_home','other_article','station_map','reference','other_internal','other_external']);
const fail = (message,status=400) => Response.json({success:false,message},{status});
export async function onRequestPost({request,env}) {
  try {
    if (Number(request.headers.get('content-length') || 0)>4096) return fail('Payload too large',413);
    const payload=await request.text();
    if (payload.length>4096) return fail('Payload too large',413);
    const d=JSON.parse(payload);
    if (!d || typeof d!=='object'||Array.isArray(d) || !EVENTS.has(d.eventType) ||
        !ID.test(d.visitId||'') || !ID.test(d.sessionId||'') || !PATH.test(d.articlePath||'')) return fail('Invalid event');
    if(!env.DB) return fail('DB binding missing',500);
    if(d.eventType==='click') {
      if(!ID.test(d.clickId||'') || !LINKS.has(d.linkType)) return fail('Invalid click');
      await env.DB.prepare(`INSERT INTO article_analytics_clicks (click_id,visit_id,article_path,link_type)
        SELECT ?,visit_id,article_path,? FROM article_analytics_visits
        WHERE visit_id=? AND session_id=? AND article_path=?
        ON CONFLICT(click_id) DO NOTHING`).bind(d.clickId,d.linkType,d.visitId,d.sessionId,d.articlePath).run();
      return Response.json({success:true});
    }
    if(typeof d.articleTitle!=='string'||!d.articleTitle.trim()||d.articleTitle.length>100 ||
       !Number.isInteger(d.maxScrollPercent)||d.maxScrollPercent<0||d.maxScrollPercent>100 ||
       !Number.isInteger(d.activeSeconds)||d.activeSeconds<0||d.activeSeconds>1800 ||
       !SOURCE.has(d.entrySource) || !NEXT.has(d.nextPageType)) return fail('Invalid visit');
    await env.DB.prepare(`INSERT INTO article_analytics_visits
      (visit_id,session_id,article_path,article_title,max_scroll_percent,active_seconds,entry_source)
      VALUES (?,?,?,?,?,?,?) ON CONFLICT(visit_id) DO NOTHING`)
      .bind(d.visitId,d.sessionId,d.articlePath,d.articleTitle.trim(),d.maxScrollPercent,d.activeSeconds,d.entrySource).run();
    await env.DB.prepare(`UPDATE article_analytics_visits SET
      last_seen_at=CURRENT_TIMESTAMP,
      max_scroll_percent=MAX(max_scroll_percent,?),
      active_seconds=MAX(active_seconds,?),
      next_page_type=CASE WHEN ?='end' THEN ? ELSE next_page_type END,
      completed=CASE WHEN ?='end' THEN 1 ELSE completed END
      WHERE visit_id=? AND session_id=? AND article_path=? AND completed=0`)
      .bind(d.maxScrollPercent,d.activeSeconds,d.eventType,d.nextPageType,d.eventType,d.visitId,d.sessionId,d.articlePath).run();
    return Response.json({success:true});
  }catch(err){console.error('article analytics:',err);return fail('Failed to record',500)}
}
