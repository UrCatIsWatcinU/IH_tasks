-- -----------------------------------------------------
-- Schema IThubActivities
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `IThubActivities` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;
USE `IThubActivities` ;

-- -----------------------------------------------------
-- Table `IThubActivities`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `UsersEmail_idx` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Directions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Directions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rusName` VARCHAR(10) NOT NULL,
  `engName` VARCHAR(10) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Groupes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Groupes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course` INT NOT NULL,
  `directionId` INT NULL,
  `number` INT NOT NULL,
  `year` INT NULL,
  `fullName` VARCHAR(20) NULL,
  `emailName` VARCHAR(20) NULL,
  PRIMARY KEY (`id`),
  INDEX `GroupesDirections_idx` (`directionId` ASC) VISIBLE,
  CONSTRAINT `GroupesDirections`
    FOREIGN KEY (`directionId`)
    REFERENCES `IThubActivities`.`Directions` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Students`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Students` (
  `id` INT NULL,
  `groupId` INT NULL,
  `distant` TINYINT NULL,
  `UISettings` JSON NULL,
  PRIMARY KEY (`id`),
  INDEX `StudentsGroup_idx` (`groupId` ASC) VISIBLE,
  CONSTRAINT `StudentsInheritUsers`
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `StudentsGroup`
    FOREIGN KEY (`groupId`)
    REFERENCES `IThubActivities`.`Groupes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Activities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Activities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NULL,
  `starttime` DATETIME NOT NULL,
  `endtime` DATETIME NOT NULL,
  `rrule` VARCHAR(500) NOT NULL,
  `priority` VARCHAR(45) NOT NULL,
  `studentId` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `ActivitiesStudent_idx` (`studentId` ASC) VISIBLE,
  CONSTRAINT `ActivitiesStudent`
    FOREIGN KEY (`studentId`)
    REFERENCES `IThubActivities`.`Students` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Places`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Places` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Auds`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Auds` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `placeId` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `AudsPlace_idx` (`placeId` ASC) VISIBLE,
  CONSTRAINT `AudsPlace`
    FOREIGN KEY (`placeId`)
    REFERENCES `IThubActivities`.`Places` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Subjects`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Subjects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Teachers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Teachers` (
  `id` INT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `TeachersInheritUsers`
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Lessons`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Lessons` (
  `activityId` INT NULL,
  `subjectId` INT NULL,
  `audId` INT NULL,
  `teacherId` INT NULL,
  PRIMARY KEY (`activityId`),
  INDEX `LessonsAuds_idx` (`audId` ASC) VISIBLE,
  INDEX `LessonsSubjects_idx` (`subjectId` ASC) VISIBLE,
  INDEX `LessonsTeacher_idx` (`teacherId` ASC) VISIBLE,
  CONSTRAINT `LessonsInheritActivities`
    FOREIGN KEY (`activityId`)
    REFERENCES `IThubActivities`.`Activities` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `LessonsAud`
    FOREIGN KEY (`audId`)
    REFERENCES `IThubActivities`.`Auds` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `LessonsSubject`
    FOREIGN KEY (`subjectId`)
    REFERENCES `IThubActivities`.`Subjects` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `LessonsTeacher`
    FOREIGN KEY (`teacherId`)
    REFERENCES `IThubActivities`.`Teachers` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`TasksStatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`TasksStatuses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Tasks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Tasks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `studentId` INT NULL,
  `deadline` DATETIME NULL,
  `reminder` DATETIME NULL,
  `reminderRrule` VARCHAR(200) NULL,
  `statusId` INT NULL,
  `title` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  INDEX `TasksStudent_idx` (`studentId` ASC) VISIBLE,
  INDEX `TasksTasksStatuses_idx` (`statusId` ASC) VISIBLE,
  CONSTRAINT `TasksStudent`
    FOREIGN KEY (`studentId`)
    REFERENCES `IThubActivities`.`Students` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `TasksTasksStatuses`
    FOREIGN KEY (`statusId`)
    REFERENCES `IThubActivities`.`TasksStatuses` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Homeworks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Homeworks` (
  `id` INT NULL,
  `subjectId` INT NULL,
  `teacherId` INT NULL,
  `description` TEXT NULL,
  `link` VARCHAR(100) NOT NULL,
  INDEX `HomeworksSubject_idx` (`subjectId` ASC) VISIBLE,
  INDEX `HomeworksTeacher_idx` (`teacherId` ASC) VISIBLE,
  PRIMARY KEY (`id`),
  CONSTRAINT `HomeworksSubject`
    FOREIGN KEY (`subjectId`)
    REFERENCES `IThubActivities`.`Subjects` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `HomeworksTeacher`
    FOREIGN KEY (`teacherId`)
    REFERENCES `IThubActivities`.`Teachers` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `HomeworksInheritTasks`
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Tasks` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`AdminsRoles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`AdminsRoles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Admins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Admins` (
  `id` INT NULL,
  `roleId` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `AdminsAdminsRole_idx` (`roleId` ASC) VISIBLE,
  CONSTRAINT `AdminsAdminsRole`
    FOREIGN KEY (`roleId`)
    REFERENCES `IThubActivities`.`AdminsRoles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `AdminsInheritUsers`
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`Curators`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`Curators` (
  `id` INT NULL,
  `groupId` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `CuratorsGroup_idx` (`groupId` ASC) VISIBLE,
  CONSTRAINT `CuratorsGroup`
    FOREIGN KEY (`groupId`)
    REFERENCES `IThubActivities`.`Groupes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `CuratorsInheritStudents `
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Students` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`LessonsForGroupes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`LessonsForGroupes` (
  `lessonId` INT NOT NULL,
  `groupeId` INT NULL,
  PRIMARY KEY (`lessonId`, `groupeId`),
  INDEX `GroupesInLesson_idx` (`groupeId` ASC) VISIBLE,
  CONSTRAINT `LessonsForGroup`
    FOREIGN KEY (`lessonId`)
    REFERENCES `IThubActivities`.`Lessons` (`activityId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `GroupesInLesson`
    FOREIGN KEY (`groupeId`)
    REFERENCES `IThubActivities`.`Groupes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`ActivitiesFromTasks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`ActivitiesFromTasks` (
  `id` INT NULL,
  `taskId` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `ActivitiesFromTasksTask_idx` (`taskId` ASC) VISIBLE,
  CONSTRAINT `ActivitiesFromTasksInheritActivities`
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Activities` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `ActivitiesFromTasksTask`
    FOREIGN KEY (`taskId`)
    REFERENCES `IThubActivities`.`Tasks` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`CustomActivities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`CustomActivities` (
  `id` INT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `CustomActivitiesInheritActivities`
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Activities` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IThubActivities`.`CustomTasks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IThubActivities`.`CustomTasks` (
  `id` INT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `CustomTasksInheritTasks`
    FOREIGN KEY (`id`)
    REFERENCES `IThubActivities`.`Tasks` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;