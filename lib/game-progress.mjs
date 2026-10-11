// Aggregate all verified game sessions, independent of the 200-row analytics window.
export const gameProgressSQL=`SELECT json_extract(payload,'$.gameScene') AS scene,
 CAST(json_extract(payload,'$.gameLevel') AS INTEGER) AS level, COUNT(*) AS attempts,
 MAX(CASE WHEN NOT EXISTS(SELECT 1 FROM json_each(json_extract(payload,'$.answers')) a WHERE json_extract(a.value,'$.correct') != 1) THEN 1 ELSE 0 END) AS mastered,
 MAX(json_extract(payload,'$.stars')) AS stars
 FROM sessions WHERE owner=? AND profile=? AND json_extract(payload,'$.grade')=?
 AND json_extract(payload,'$.verified')=1 AND json_extract(payload,'$.gameLevel') BETWEEN 1 AND 20
 GROUP BY scene,level`;
