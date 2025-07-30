-- 更新现有订单记录的商品信息
-- 根据订单金额推断商品类型

-- 更新金额为8的订单为itemBtn1（8美金-12钻石）
UPDATE payment_records 
SET product_id = 'itemBtn1', 
    product_info = '钻石礼包-12钻石', 
    product_details = '{"diamonds": 12, "isFirstCharge": false}' 
WHERE amount = 8.00 AND product_id IS NULL;

-- 更新金额为20的订单为itemBtn2（20美金-40钻石）
UPDATE payment_records 
SET product_id = 'itemBtn2', 
    product_info = '钻石礼包-40钻石', 
    product_details = '{"diamonds": 40, "isFirstCharge": false}' 
WHERE amount = 20.00 AND product_id IS NULL;

-- 更新金额为40的订单为itemBtn3（40美金-70钻石）
UPDATE payment_records 
SET product_id = 'itemBtn3', 
    product_info = '钻石礼包-70钻石', 
    product_details = '{"diamonds": 70, "isFirstCharge": false}' 
WHERE amount = 40.00 AND product_id IS NULL;

-- 更新金额为80的订单为itemBtn4（80美金-140钻石）
UPDATE payment_records 
SET product_id = 'itemBtn4', 
    product_info = '钻石礼包-140钻石', 
    product_details = '{"diamonds": 140, "isFirstCharge": false}' 
WHERE amount = 80.00 AND product_id IS NULL;

-- 更新金额为100的订单为itemBtn5（100美金-180钻石）
UPDATE payment_records 
SET product_id = 'itemBtn5', 
    product_info = '钻石礼包-180钻石', 
    product_details = '{"diamonds": 180, "isFirstCharge": false}' 
WHERE amount = 100.00 AND product_id IS NULL;

-- 更新金额为200的订单为itemBtn11（道具礼包）
UPDATE payment_records 
SET product_id = 'itemBtn11', 
    product_info = '道具礼包-50钻石+道具', 
    product_details = '{"diamonds": 50, "bombBomb": 3, "bombHor": 3, "bombVer": 5, "bombAllSame": 2}' 
WHERE amount = 200.00 AND product_id IS NULL;

-- 更新金额为500的订单为itemBtn12（道具礼包）
UPDATE payment_records 
SET product_id = 'itemBtn12', 
    product_info = '道具礼包-200钻石+道具', 
    product_details = '{"diamonds": 200, "bombBomb": 5, "bombHor": 5, "bombVer": 10, "bombAllSame": 3}' 
WHERE amount = 500.00 AND product_id IS NULL;

-- 更新金额为1000的订单为itemBtn13（道具礼包）
UPDATE payment_records 
SET product_id = 'itemBtn13', 
    product_info = '道具礼包-钻石+道具', 
    product_details = '{"bombBomb": 10, "bombHor": 10, "bombVer": 20, "bombAllSame": 5}' 
WHERE amount = 1000.00 AND product_id IS NULL;

-- 更新金额为1500的订单为itemBtn14（道具礼包）
UPDATE payment_records 
SET product_id = 'itemBtn14', 
    product_info = '道具礼包-1000钻石+道具', 
    product_details = '{"diamonds": 1000, "bombBomb": 20, "bombHor": 20, "bombAllSame": 10}' 
WHERE amount = 1500.00 AND product_id IS NULL;

-- 查询更新结果
SELECT id, amount, product_id, product_info FROM payment_records; 