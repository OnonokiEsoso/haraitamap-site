-- 登録済み駅の検索回数
SELECT station_name, search_count, updated_at
FROM station_searches
ORDER BY search_count DESC, station_name ASC;

-- 駅ページ閲覧数
SELECT station_name, station_path, view_count, updated_at
FROM station_views
ORDER BY view_count DESC, station_name ASC;

-- 路線フィルター利用回数
SELECT line_id, usage_count, updated_at
FROM line_filter_usage
ORDER BY usage_count DESC, line_id ASC;

-- 見つからなかった駅
SELECT search_term, search_count, updated_at
FROM missing_station_searches
ORDER BY search_count DESC, search_term ASC;

-- 駅情報の評価
SELECT
  station_name,
  station_path,
  helpful_count,
  outdated_count,
  helpful_count + outdated_count AS total_feedback,
  CASE
    WHEN helpful_count + outdated_count = 0 THEN NULL
    ELSE ROUND(helpful_count * 100.0 / (helpful_count + outdated_count), 1)
  END AS helpful_rate
FROM station_feedback
ORDER BY outdated_count DESC, total_feedback DESC, helpful_count DESC;

-- 駅ページの滞在時間・閲覧時間帯
SELECT
  station_name,
  station_path,
  measured_views,
  total_active_seconds,
  ROUND(total_active_seconds * 1.0 / NULLIF(measured_views, 0), 1) AS avg_active_seconds,
  quick_exit_count,
  long_view_count,
  bucket_0_10,
  bucket_11_30,
  bucket_31_60,
  bucket_61_120,
  bucket_121_plus,
  updated_at
FROM station_engagement
ORDER BY measured_views DESC, avg_active_seconds DESC;

-- トイレ候補クリック
SELECT station_name, station_path, event_value AS toilet_id, usage_count, updated_at
FROM station_interactions
WHERE event_type = 'candidate_click'
ORDER BY usage_count DESC, station_name ASC;

-- 並び替え利用
SELECT event_value AS sort_type, SUM(usage_count) AS usage_count
FROM station_interactions
WHERE event_type = 'sort_change'
GROUP BY event_value
ORDER BY usage_count DESC;

-- 駅ごとの情報提供フォームクリック
SELECT station_name, station_path, SUM(usage_count) AS report_clicks
FROM station_interactions
WHERE event_type = 'report_click'
GROUP BY station_path, station_name
ORDER BY report_clicks DESC;

-- 駅ページへの流入元
SELECT event_value AS source, SUM(usage_count) AS usage_count
FROM station_interactions
WHERE event_type = 'entry_source'
GROUP BY event_value
ORDER BY usage_count DESC;

-- 「場所が分からない」フィードバック
SELECT station_name, station_path, SUM(usage_count) AS location_unclear_count
FROM station_interactions
WHERE event_type = 'feedback_location_unclear'
GROUP BY station_path, station_name
ORDER BY location_unclear_count DESC, station_name ASC;
