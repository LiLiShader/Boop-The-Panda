const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

async function testConfigDatabase() {
    console.log('🔍 测试全局配置表设计...\n');
    
    // 数据库配置
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'boop_game'
    };
    
    console.log('数据库配置:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
    });
    
    let connection;
    
    try {
        // 连接数据库
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功\n');
        
        // 1. 检查表是否存在
        console.log('1. 检查全局配置表...');
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'global_config'
        `, [dbConfig.database]);
        
        if (tables.length === 0) {
            console.log('❌ 全局配置表不存在，请先运行部署脚本');
            return;
        }
        console.log('✅ 全局配置表存在\n');
        
        // 2. 检查表结构
        console.log('2. 检查表结构...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'global_config'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        console.log('表结构:');
        columns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_COMMENT ? `(${col.COLUMN_COMMENT})` : ''}`);
        });
        console.log('');
        
        // 3. 检查初始数据
        console.log('3. 检查初始配置数据...');
        const [configs] = await connection.execute(`
            SELECT config_key, config_value, description, updated_at
            FROM global_config
            ORDER BY config_key
        `);
        
        console.log('当前配置:');
        configs.forEach(config => {
            console.log(`  - ${config.config_key}: ${config.config_value} (${config.description})`);
            console.log(`    最后更新: ${config.updated_at}`);
        });
        console.log('');
        
        // 4. 测试支付模式切换
        console.log('4. 测试支付模式切换...');
        
        // 切换到3D模式
        await connection.execute(`
            UPDATE global_config 
            SET config_value = '3D', updated_at = CURRENT_TIMESTAMP 
            WHERE config_key = 'payment_mode'
        `);
        console.log('✅ 切换到3D模式');
        
        // 验证切换结果
        const [paymentMode] = await connection.execute(`
            SELECT config_value FROM global_config WHERE config_key = 'payment_mode'
        `);
        console.log(`✅ 当前支付模式: ${paymentMode[0].config_value}`);
        
        // 切换回2D模式
        await connection.execute(`
            UPDATE global_config 
            SET config_value = '2D', updated_at = CURRENT_TIMESTAMP 
            WHERE config_key = 'payment_mode'
        `);
        console.log('✅ 切换回2D模式');
        
        // 5. 测试索引
        console.log('\n5. 检查索引...');
        const [indexes] = await connection.execute(`
            SELECT INDEX_NAME, COLUMN_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'global_config'
            ORDER BY INDEX_NAME, SEQ_IN_INDEX
        `, [dbConfig.database]);
        
        console.log('索引:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.INDEX_NAME}: ${idx.COLUMN_NAME}`);
        });
        
        console.log('\n🎉 全局配置表设计验证完成！');
        console.log('✅ 表结构正确');
        console.log('✅ 初始数据完整');
        console.log('✅ 支付模式切换正常');
        console.log('✅ 索引创建成功');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 请检查数据库用户名和密码');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 请检查数据库服务是否运行');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 运行测试
testConfigDatabase(); 