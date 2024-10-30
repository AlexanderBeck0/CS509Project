CREATE TABLE `Admin` (
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  PRIMARY KEY (`username`,`password`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `password_UNIQUE` (`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Bid` (
  `id` int NOT NULL,
  `bid` int NOT NULL,
  `timeOfBid` datetime NOT NULL,
  `buyer_username` varchar(20) NOT NULL,
  `item_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bidID_UNIQUE` (`id`),
  KEY `buyer_id_idx` (`buyer_username`),
  KEY `item_id_idx` (`item_id`),
  CONSTRAINT `buyer_id` FOREIGN KEY (`buyer_username`) REFERENCES `Buyer` (`username`),
  CONSTRAINT `fk_buyer` FOREIGN KEY (`buyer_username`) REFERENCES `Buyer` (`username`),
  CONSTRAINT `fk_item` FOREIGN KEY (`item_id`) REFERENCES `Item` (`id`),
  CONSTRAINT `item_id` FOREIGN KEY (`item_id`) REFERENCES `Item` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Buyer` (
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `funds` int DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Item` (
  `id` int NOT NULL,
  `name` varchar(45) NOT NULL DEFAULT 'ExampleItem',
  `description` varchar(100) NOT NULL DEFAULT 'InsertDescription',
  `image` varchar(200) NOT NULL DEFAULT 'ADDIMAGEURL',
  `initialPrice` int NOT NULL DEFAULT '1',
  `price` int NOT NULL DEFAULT '1',
  `startDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endDate` datetime DEFAULT NULL,
  `archived` tinyint NOT NULL,
  `status` varchar(20) NOT NULL,
  `seller_username` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`) /*!80000 INVISIBLE */,
  KEY `seller_username_idx` (`seller_username`),
  CONSTRAINT `seller_username` FOREIGN KEY (`seller_username`) REFERENCES `Seller` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Seller` (
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `profit` int DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
