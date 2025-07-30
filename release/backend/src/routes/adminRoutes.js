const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// 获取所有用户
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM users ORDER BY created_at DESC');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户列表失败: ' + error.message
        });
    }
});

// 获取单个用户信息
router.get('/users/:pid', async (req, res) => {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM users WHERE pid = ?', [req.params.pid]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到用户'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户信息失败: ' + error.message
        });
    }
});

// 创建新用户
router.post('/users', async (req, res) => {
    const { pid, name, password, level = 1, gold = 500, icon = '1' } = req.body;
    
    if (!pid || !name || !password) {
        return res.status(400).json({
            success: false,
            message: 'pid, name和password为必填项'
        });
    }
    
    try {
        // 检查用户是否已存在
        const [existingUsers] = await pool.promise().query('SELECT * FROM users WHERE pid = ?', [pid]);
        
        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: '用户已存在'
            });
        }
        
        // 创建新用户
        const [result] = await pool.promise().query(
            'INSERT INTO users (pid, name, password, level, gold, icon) VALUES (?, ?, ?, ?, ?, ?)',
            [pid, name, password, level, gold, icon]
        );
        
        res.status(201).json({
            success: true,
            message: '用户创建成功',
            data: {
                id: result.insertId,
                pid,
                name,
                level,
                gold,
                icon
            }
        });
    } catch (error) {
        console.error('创建用户失败:', error);
        res.status(500).json({
            success: false,
            message: '创建用户失败: ' + error.message
        });
    }
});

// 更新用户信息
router.put('/users/:pid', async (req, res) => {
    const { name, password, level, gold, icon } = req.body;
    const pid = req.params.pid;
    
    if (!pid) {
        return res.status(400).json({
            success: false,
            message: 'pid为必填项'
        });
    }
    
    try {
        // 构建更新字段
        const updateFields = [];
        const values = [];
        
        if (name !== undefined) {
            updateFields.push('name = ?');
            values.push(name);
        }
        
        if (password !== undefined) {
            updateFields.push('password = ?');
            values.push(password);
        }
        
        if (level !== undefined) {
            updateFields.push('level = ?');
            values.push(level);
        }
        
        if (gold !== undefined) {
            updateFields.push('gold = ?');
            values.push(gold);
        }
        
        if (icon !== undefined) {
            updateFields.push('icon = ?');
            values.push(icon);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有提供要更新的字段'
            });
        }
        
        values.push(pid);
        
        // 更新用户
        const [result] = await pool.promise().query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE pid = ?`,
            values
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到用户'
            });
        }
        
        res.json({
            success: true,
            message: '用户更新成功'
        });
    } catch (error) {
        console.error('更新用户失败:', error);
        res.status(500).json({
            success: false,
            message: '更新用户失败: ' + error.message
        });
    }
});

// 获取支付记录
router.get('/payments', async (req, res) => {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM payment_records ORDER BY pay_time DESC');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('获取支付记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取支付记录失败: ' + error.message
        });
    }
});

// 获取用户支付记录
router.get('/users/:pid/payments', async (req, res) => {
    try {
        const [rows] = await pool.promise().query(
            'SELECT * FROM payment_records WHERE user_id = ? ORDER BY pay_time DESC',
            [req.params.pid]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('获取用户支付记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户支付记录失败: ' + error.message
        });
    }
});

module.exports = router; 