CREATE TABLE `Admin` (
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  PRIMARY KEY (`username`,`password`),
  UNIQUE KEY `idAdmin_UNIQUE` (`username`),
  UNIQUE KEY `password_UNIQUE` (`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Bid` (
  `ID` int NOT NULL,
  `bid` int NOT NULL,
  `timeOfBid` datetime NOT NULL,
  `buyer_username` varchar(20) NOT NULL,
  `item_id` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `bidID_UNIQUE` (`ID`),
  KEY `buyer_id_idx` (`buyer_username`),
  KEY `item_id_idx` (`item_id`),
  CONSTRAINT `buyer_id` FOREIGN KEY (`buyer_username`) REFERENCES `Buyer` (`username`),
  CONSTRAINT `item_id` FOREIGN KEY (`item_id`) REFERENCES `Item` (`ID`)
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
  `ID` int NOT NULL,
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
  PRIMARY KEY (`ID`),
  UNIQUE KEY `itemID_UNIQUE` (`ID`),
  KEY `seller_id_idx` (`seller_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Seller` (
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `profit` int DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
