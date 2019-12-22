ALTER TABLE `Users` 
    ADD CONSTRAINT `FK_test` 
        FOREIGN KEY (`loginId`) 
        REFERENCES `Logins` (`loginId`) 
        ON UPDATE RESTRICT ON DELETE CASCADE;
