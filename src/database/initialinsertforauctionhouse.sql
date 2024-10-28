-- Insert an Admin User
INSERT IGNORE INTO Admin (username, password) VALUES ('admin1', 'admin123');

-- Insert Buyers
INSERT IGNORE INTO Buyer (username, password, status, funds) VALUES 
('B1', 'B123', 'Active', 1000),
('B2', 'B234', 'Active', 500);

-- Insert Sellers
INSERT IGNORE INTO Seller (username, password, status, profit) VALUES 
('S1', 'S123', 'Active', 100),
('S2', 'S234', 'Active', 0);

-- Insert Items for Each Seller
INSERT IGNORE INTO Item (id, name, description, image, initialPrice, price, startDate, endDate, archived, status, seller_username) VALUES 
(1, 'Laptop', 'High-end gaming laptop', 'laptop.jpg', 800, 850, '2024-10-23 09:00:00', '2024-10-31 18:00:00', 0, 'Active', 'S1'),
(2, 'Smartphone', 'Latest model smartphone', 'smartphone.jpg', 600, 650, '2024-10-23 09:00:00', '2024-10-31 18:00:00', 0, 'Active', 'S1'),
(3, 'Tablet', '10-inch display tablet', 'tablet.jpg', 300, 320, '2024-10-23 09:00:00', '2024-10-31 18:00:00', 0, 'Active', 'S2'),
(4, 'Monitor', '4K Ultra HD monitor', 'monitor.jpg', 200, 210, '2024-10-23 09:00:00', '2024-10-31 18:00:00', 0, 'Active', 'S2');

-- Insert Bids from Each Buyer
INSERT IGNORE INTO Bid (id, bid, timeOfBid, buyer_username, item_id) VALUES 
(1, 850, '2024-10-23 10:15:00', 'B1', 1),
(2, 650, '2024-10-23 10:30:00', 'B1', 2),
(3, 320, '2024-10-23 11:00:00', 'B2', 3),
(4, 210, '2024-10-23 11:20:00', 'B2', 4);


-- Ensure that Foreign Keys Exist
ALTER TABLE Bid 
ADD CONSTRAINT fk_buyer FOREIGN KEY (buyer_username) REFERENCES Buyer(username),
ADD CONSTRAINT fk_item FOREIGN KEY (item_id) REFERENCES Item(id);
