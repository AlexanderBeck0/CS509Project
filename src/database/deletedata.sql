SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

DELETE FROM Item;
DELETE FROM Buyer;
DELETE FROM Bid;
DELETE FROM Seller;
DROP TABLE IF EXISTS Buyer;
DROP TABLE IF EXISTS Seller;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;