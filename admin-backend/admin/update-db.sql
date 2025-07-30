-- 修改payment_records表，添加商品信息字段
ALTER TABLE payment_records 
ADD COLUMN product_id VARCHAR(20) DEFAULT NULL COMMENT '商品ID',
ADD COLUMN product_info TEXT DEFAULT NULL COMMENT '商品信息',
ADD COLUMN product_details JSON DEFAULT NULL COMMENT '商品详细信息'; 