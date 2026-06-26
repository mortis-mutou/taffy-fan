-- 查看当前所有视频数据
SELECT id, title, description, created_at FROM videos;

-- 或者，如果表名不同，可能是 video 表？
-- 先看看有哪些表
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';