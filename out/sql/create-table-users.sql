CREATE TABLE `Users` (
    `userId` INT SIGNED NOT NULL UNIQUE ,
    `loginId` INT SIGNED NOT NULL UNIQUE ,
    `accountState` ENUM('abc')   ,
    PRIMARY KEY (userId)
);
