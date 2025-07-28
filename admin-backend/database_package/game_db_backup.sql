/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: game_db
-- ------------------------------------------------------
-- Server version	10.11.13-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `payment_records`
--

DROP TABLE IF EXISTS `payment_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `order_no` varchar(64) NOT NULL,
  `pay_time` datetime NOT NULL,
  `raw_response` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `product_id` varchar(20) DEFAULT NULL COMMENT '商品ID',
  `product_info` text DEFAULT NULL COMMENT '商品信息',
  `product_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '商品详细信息' CHECK (json_valid(`product_details`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_records`
--

LOCK TABLES `payment_records` WRITE;
/*!40000 ALTER TABLE `payment_records` DISABLE KEYS */;
INSERT INTO `payment_records` VALUES
(1,'testid','测试用户',8.00,'ORDER123456','2024-07-21 12:00:00','{\"code\":\"P0001\",\"message\":\"success\"}','2025-07-21 18:12:11','itemBtn1','钻石礼包-12钻石','{\"diamonds\": 12, \"isFirstCharge\": false}'),
(2,'19970211','张璨',8.00,'10014017531218513781','2025-07-21 18:17:30','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017531218513781\",\"merNo\":\"100140\",\"billNo\":\"1001404732000616\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"82a521eac4d684d113d7c8cdaa5b9ed9\",\"tradeTime\":1753121851212,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"l0D7Z2E2I044GF9hZNMM0wf2Opeg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-21 18:17:33','itemBtn1','钻石礼包-12钻石','{\"diamonds\": 12, \"isFirstCharge\": false}'),
(3,'19970211','张璨',100.00,'10014017531224843998','2025-07-21 18:28:03','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017531224843998\",\"merNo\":\"100140\",\"billNo\":\"1001408026305646\",\"amount\":\"100.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"6136d4c8e9919b81ac3fbb1a5ff9e5e0\",\"tradeTime\":1753122484270,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"l0D7Z2E2I044GF9hZNMM0wf2Opeg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-21 18:28:06','itemBtn5','钻石礼包-180钻石','{\"diamonds\": 180, \"isFirstCharge\": false}'),
(4,'19970211','张璨',20.00,'10014017531265541176','2025-07-21 19:35:53','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017531265541176\",\"merNo\":\"100140\",\"billNo\":\"1001405040708357\",\"amount\":\"20.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"561c75b825a92e5953aee83bdff15a10\",\"tradeTime\":1753126553992,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"l0D7Z2E2I044GF9hZNMM0wf2Opeg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-21 19:35:55','itemBtn2','钻石礼包-40钻石','{\"diamonds\": 40, \"isFirstCharge\": false}'),
(5,'19970211','张璨',100.00,'10014017531265950468','2025-07-21 19:36:34','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017531265950468\",\"merNo\":\"100140\",\"billNo\":\"1001409138001100\",\"amount\":\"100.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"deefcf9c2f8adc8843333858583a169b\",\"tradeTime\":1753126594926,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"l0D7Z2E2I044GF9hZNMM0wf2Opeg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-21 19:36:37','itemBtn5','钻石礼包-180钻石','{\"diamonds\": 180, \"isFirstCharge\": false}'),
(6,'19970211','张璨',40.00,'10014017531594733466','2025-07-22 04:44:32','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017531594733466\",\"merNo\":\"100140\",\"billNo\":\"1001406896601249\",\"amount\":\"40.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"20129b8a2937ef0ea820f588abb0b263\",\"tradeTime\":1753159473208,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"t02782W2t184Yevkp0dkqIWw2qRQ==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-22 04:44:35','itemBtn3','钻石礼包-70钻石','{\"diamonds\": 70, \"isFirstCharge\": false}'),
(7,'qqq','www',80.00,'10014017531615128226','2025-07-22 05:18:32','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017531615128226\",\"merNo\":\"100140\",\"billNo\":\"1001400882604410\",\"amount\":\"80.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"e90535b63fecd793add137a6da0c4f98\",\"tradeTime\":1753161512684,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"k057L2c251/4m9gXyEKtNSV+YK4g==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-22 05:18:34','itemBtn4','钻石礼包-140钻石','{\"diamonds\": 140, \"isFirstCharge\": false}'),
(8,'19970211','张璨',200.00,'10014017533900256265','2025-07-24 20:47:06','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017533900256265\",\"merNo\":\"100140\",\"billNo\":\"1001402375900634\",\"amount\":\"200.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"7e1bb027d9a3fa9116cf5c0ab36a0de2\",\"tradeTime\":1753390025513,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"y0J7A2t510/67chXbMGgUNEXdcEw==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1434\"}','2025-07-24 20:47:07','itemBtn11','道具礼包-50钻石+道具','{\"diamonds\": 50, \"bombBomb\": 3, \"bombHor\": 3, \"bombVer\": 5, \"bombAllSame\": 2}'),
(9,'19970211','张璨',100.00,'10014017533901316183','2025-07-24 20:48:52','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017533901316183\",\"merNo\":\"100140\",\"billNo\":\"1001402976602443\",\"amount\":\"100.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"cf6751c923ebc091c3ae748b1fed1beb\",\"tradeTime\":1753390131504,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"y0J7A2t510/67chXbMGgUNEXdcEw==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1434\"}','2025-07-24 20:48:53','itemBtn5','钻石礼包-180钻石','{\"diamonds\": 180, \"isFirstCharge\": false}'),
(10,'testid','测试用户',100.00,'ORDER123456789','2024-07-21 12:00:00','{\"code\":\"P0001\",\"message\":\"success\"}','2025-07-24 21:25:06','itemBtn5','钻石礼包-180钻石','{\"diamonds\": 180, \"isFirstCharge\": false}'),
(11,'19970211','张璨',80.00,'10014017533924549027','2025-07-24 21:27:36','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017533924549027\",\"merNo\":\"100140\",\"billNo\":\"1001405273500173\",\"amount\":\"80.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"8d0ca61aea6670bd734bac3ac124ad7d\",\"tradeTime\":1753392454762,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"y0J7A2t510/67chXbMGgUNEXdcEw==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1434\"}','2025-07-24 21:27:36','itemBtn4','钻石礼包-140钻石','{\"diamonds\": 140, \"isFirstCharge\": false}'),
(12,'19970211','张璨',1500.00,'10014017533952999866','2025-07-24 22:15:01','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017533952999866\",\"merNo\":\"100140\",\"billNo\":\"1001409781307754\",\"amount\":\"1500.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"1b5dd5f73fd42095d59da45e552b7abf\",\"tradeTime\":1753395299873,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"u0O782E580t8JY1a5Yh1UzlpBedQ==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1434\"}','2025-07-24 22:15:01','itemBtn14','钻石礼包-1000钻石','{\"diamonds\":1000,\"bombBomb\":20,\"bombHor\":20,\"bombAllSame\":10}'),
(13,'19970211','张璨',8.00,'10014017533962221420','2025-07-24 22:30:23','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017533962221420\",\"merNo\":\"100140\",\"billNo\":\"1001402012605800\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"123\",\"md5Info\":\"c48645f2d327a696c5beb6e16fb2d9a6\",\"tradeTime\":1753396222026,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"u0O782E580t8JY1a5Yh1UzlpBedQ==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1434\"}','2025-07-24 22:30:24','itemBtn6','钻石礼包-24钻石','{\"diamonds\":24,\"isFirstCharge\":true}'),
(14,'niuyueren','test',80.00,'10014017536362022975','2025-07-27 17:10:01','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536362022975\",\"merNo\":\"100140\",\"billNo\":\"1001409945003859\",\"amount\":\"80.00\",\"currency\":\"6\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"89ff9a6299fd31f17ea4a9bb112475a1\",\"tradeTime\":1753636202212,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"z0c752p8v0O2+FnjCXoEOgy1irBA==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"0.0484\"}','2025-07-27 17:10:03','itemBtn1','钻石礼包-140钻石','{\"diamonds\":140,\"isFirstCharge\":false}'),
(15,'niuyueren','test',8.00,'10014017536367894876','2025-07-27 17:19:48','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536367894876\",\"merNo\":\"100140\",\"billNo\":\"1001408656306782\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"297f5f527374269d4c5f9d1f9d9efb7a\",\"tradeTime\":1753636789395,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"z0c752p8v0O2+FnjCXoEOgy1irBA==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1584\"}','2025-07-27 17:19:51','itemBtn1','钻石礼包-12钻石','{\"diamonds\":12,\"isFirstCharge\":false}'),
(16,'niuyueren','test',8.00,'10014017536401632461','2025-07-27 18:16:03','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536401632461\",\"merNo\":\"100140\",\"billNo\":\"1001406186205800\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"fd57dae5792b67b8601a88ba5ec5489a\",\"tradeTime\":1753640163134,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"f0i7+2J8s0K4T2tozPZnOfQzwnKg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1584\"}','2025-07-27 18:16:04','itemBtn1','钻石礼包-12钻石','{\"diamonds\":12,\"isFirstCharge\":false}'),
(17,'niuyueren','test',8.00,'10014017536402059297','2025-07-27 18:16:46','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536402059297\",\"merNo\":\"100140\",\"billNo\":\"1001400433702599\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"6d9a6508a8693c73c9072804987810e2\",\"tradeTime\":1753640205832,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"f0i7+2J8s0K4T2tozPZnOfQzwnKg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1584\"}','2025-07-27 18:16:47','itemBtn1','钻石礼包-12钻石','{\"diamonds\":12,\"isFirstCharge\":false}'),
(18,'ooooo','test',100.00,'1001403119605507','2025-07-27 22:17:12','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536546325714\",\"merNo\":\"100140\",\"billNo\":\"1001403119605507\",\"amount\":\"100.00\",\"currency\":\"5\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"9965d78527df1f36ea8a93e5a58f08a5\",\"tradeTime\":1753654632487,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"a0S7m2h81048ucqoUcA5O44+3xpg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"0.9119\"}','2025-07-27 22:17:14','itemBtn1','钻石礼包-180钻石','{\"diamonds\":180,\"isFirstCharge\":false}'),
(19,'ooooo','test',8.00,'1001405117002964','2025-07-27 22:27:32','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536552528942\",\"merNo\":\"100140\",\"billNo\":\"1001405117002964\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"2c4494ce67f4a452555737d9a2d384fc\",\"tradeTime\":1753655252809,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"a0S7m2h81048ucqoUcA5O44+3xpg==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1584\"}','2025-07-27 22:27:34','itemBtn1','钻石礼包-12钻石','{\"diamonds\":12,\"isFirstCharge\":false}'),
(20,'ooooo','test',500.00,'1001408454409658','2025-07-28 06:38:06','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536558860428\",\"merNo\":\"100140\",\"billNo\":\"1001408454409658\",\"amount\":\"500.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"eabe444c0082107a8f0b7e1fcc7e1d44\",\"tradeTime\":1753655885956,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"O0n7E2D8U0K8YjI+3vCW/BehylIQ==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1584\"}','2025-07-27 22:38:07','itemBtn12','钻石礼包-200钻石','{\"diamonds\":200,\"bombBomb\":5,\"bombHor\":5,\"bombVer\":10,\"bombAllSame\":3}'),
(21,'ooooo','test',8.00,'1001409208005768','2025-07-28 06:54:54','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536568940122\",\"merNo\":\"100140\",\"billNo\":\"1001409208005768\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"5abc874a5835bbd4ce9eecc12db22544\",\"tradeTime\":1753656893891,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"O0n7E2D8U0K8YjI+3vCW/BehylIQ==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1584\"}','2025-07-27 22:54:55','itemBtn1','钻石礼包-12钻石','{\"diamonds\":12,\"isFirstCharge\":false}'),
(22,'qqq','www',20.00,'1001403308106589','2025-07-28 07:57:14','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536606345359\",\"merNo\":\"100140\",\"billNo\":\"1001403308106589\",\"amount\":\"20.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"e1ef336d2422aae12015b4481f70542d\",\"tradeTime\":1753660634422,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"O0n7E2D8U0K8YjI+3vCW/BehylIQ==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1584\"}','2025-07-27 23:57:16','itemBtn1','钻石礼包-40钻石','{\"diamonds\":40,\"isFirstCharge\":false}'),
(23,'aaaaaa','test',8.00,'1001402957400194','2025-07-28 10:52:11','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536711294067\",\"merNo\":\"100140\",\"billNo\":\"1001402957400194\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"797a3663bf1d610ae2bdbf795fa3ad29\",\"tradeTime\":1753671129249,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"G0v7I2A8H1o23KAAFjzMURzo2tYA==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-28 02:52:10','itemBtn1','钻石礼包-12钻石','{\"diamonds\":12,\"isFirstCharge\":false}'),
(24,'aaaaaa','test',20.00,'1001403252300636','2025-07-28 10:55:34','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536713323231\",\"merNo\":\"100140\",\"billNo\":\"1001403252300636\",\"amount\":\"20.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"d979f17b067f5dd0ad61e2c84c63789f\",\"tradeTime\":1753671332199,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"G0v7I2A8H1o23KAAFjzMURzo2tYA==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1554\"}','2025-07-28 02:55:33','itemBtn1','钻石礼包-40钻石','{\"diamonds\":40,\"isFirstCharge\":false}'),
(25,'aaaaaa','test',8.00,'1001403370302627','2025-07-28 14:43:55','{\"code\":\"P0001\",\"message\":\"payment successful!|Success\",\"orderNo\":\"10014017536850344558\",\"merNo\":\"100140\",\"billNo\":\"1001403370302627\",\"amount\":\"8.00\",\"currency\":\"1\",\"tradeStatus\":\"S0001\",\"returnURL\":\"http://119.91.142.92:5001/api/get3DResult\",\"md5Info\":\"ddc50b0e08257702ea374a23271dbdcc\",\"tradeTime\":1753685034328,\"auth3DUrl\":null,\"billAddr\":\"buyaaa\",\"rebillToken\":\"F0r7j2z8L1z6Hu7Tc2eTisZREmug==\",\"threeDSecure\":\"\",\"cnyexchangeRate\":\"7.1549\"}','2025-07-28 06:43:55','itemBtn1','钻石礼包-12钻石','{\"diamonds\":12,\"isFirstCharge\":false}');
/*!40000 ALTER TABLE `payment_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `level` int(11) DEFAULT 1,
  `gold` int(11) DEFAULT 500,
  `icon` varchar(100) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pid` (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'testplayer1753006960449','Test Player','123456',10,1000,'1','2025-07-20 10:22:40','2025-07-20 10:22:40'),
(2,'testplayer1753006995101','Test Player','123456',10,1000,'1','2025-07-20 10:23:15','2025-07-20 10:23:15'),
(3,'2232','1231','22222314',1,500,'1','2025-07-21 14:24:41','2025-07-21 14:24:41'),
(4,'19970210','张璨','c8415544',1,500,'1','2025-07-21 14:31:31','2025-07-21 14:31:31'),
(5,'玲','haha和','111111',1,500,'1','2025-07-21 17:03:10','2025-07-21 17:03:10'),
(8,'19970211','张璨','123456',1,500,'1','2025-07-21 17:07:04','2025-07-21 17:07:04'),
(9,'qqq','www','111111',1,500,'1','2025-07-22 05:16:47','2025-07-22 05:16:47'),
(10,'大哥','大哥的号','123456',1,500,'1','2025-07-22 05:47:22','2025-07-22 05:47:22'),
(11,'Kkii','Kk','aptx4869',1,500,'1','2025-07-22 07:13:35','2025-07-22 07:13:35'),
(12,'aa','kk','123456',1,500,'1','2025-07-24 09:40:56','2025-07-24 09:40:56'),
(13,'niuyueren','test','aaaaaa',1,500,'1','2025-07-27 17:06:23','2025-07-27 17:06:23'),
(14,'ooooo','test','aaaaaa',1,500,'1','2025-07-27 20:56:40','2025-07-27 20:56:40'),
(15,'aaaaaa','test','aaaaaa',1,500,'1','2025-07-28 02:47:49','2025-07-28 02:47:49');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-28 14:56:32
