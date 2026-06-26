import { executeQuery } from '../config/database';

async function updateVideoData() {
    console.log('🔄 开始更新视频数据...');
    
    // 1️⃣ 【永雏塔菲】个人势vup的自我介绍 → 【永雏塔菲】不许有情绪，面对摄像头要开心喵
    const result1 = await executeQuery(
        `UPDATE videos SET 
            title = '【永雏塔菲】不许有情绪，面对摄像头要开心喵',
            description = '不准拉着小猫，不准有情绪，面对摄像头就要开开心心的喵！塔菲教你表情管理——笑！都给塔菲笑起来！😼喵哈哈哈哈~' 
        WHERE title LIKE '%个人势vup的自我介绍%'`
    );
    console.log(`✅ 视频1更新: ${result1.rowsAffected?.[0] || 0} 条记录受影响`);

    // 2️⃣ 永雏塔菲 - 生日会感动瞬间 → 『永雏塔菲』秒开仙人模式
    const result2 = await executeQuery(
        `UPDATE videos SET 
            title = '『永雏塔菲』秒开仙人模式',
            description = '燃起来了燃起来了！塔菲现场表演秒开仙人模式，这个查克拉控制力也太稳了吧！这就是你雏的实力吗？🔥🔥🔥' 
        WHERE title LIKE '%生日会感动瞬间%'`
    );
    console.log(`✅ 视频2更新: ${result2.rowsAffected?.[0] || 0} 条记录受影响`);

    // 3️⃣ 塔菲玩恐怖游戏被吓到 → “糖王天降，愤怒狰狞”
    const result3 = await executeQuery(
        `UPDATE videos SET 
            title = '"糖王天降，愤怒狰狞"',
            description = '糖王驾到！愤怒狰狞展开！面对恐怖游戏塔菲直接开启狂暴模式，下一秒就开始阿巴阿巴了...这反差萌谁顶得住啊！🍬👑' 
        WHERE title LIKE '%塔菲玩恐怖游戏被吓到%'`
    );
    console.log(`✅ 视频3更新: ${result3.rowsAffected?.[0] || 0} 条记录受影响`);

    console.log('🎉 所有视频数据更新完成！');

    // 检查更新结果
    const result = await executeQuery('SELECT id, title, description FROM videos');
    console.log('📋 当前视频列表:');
    result.recordset.forEach((v: any) => {
        console.log(`  [${v.id}] ${v.title}`);
    });
    
    process.exit(0);
}

updateVideoData().catch(error => {
    console.error('❌ 更新失败:', error);
    process.exit(1);
});
```
```tool
TOOL_NAME: run_terminal_command
BEGIN_ARG: command
cd backend && npx ts-node src/seed/updateVideos.ts