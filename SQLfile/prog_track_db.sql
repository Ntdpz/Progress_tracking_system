-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: prog.desigram-studio.com:3306
-- Generation Time: Oct 08, 2024 at 02:58 PM
-- Server version: 10.5.26-MariaDB-0+deb11u2-log
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prog_track_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `default_settings`
--

CREATE TABLE `default_settings` (
  `id` int(11) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `nametitle` varchar(255) DEFAULT NULL,
  `status_user` varchar(255) DEFAULT NULL,
  `role_user` varchar(255) DEFAULT NULL,
  `issue_type` varchar(255) DEFAULT NULL,
  `issue_priority` varchar(255) DEFAULT NULL,
  `level` varchar(255) DEFAULT NULL,
  `screen_type` varchar(100) DEFAULT NULL,
  `issue_status` varchar(100) DEFAULT NULL,
  `developer_status` varchar(100) DEFAULT NULL,
  `implement_status` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `default_settings`
--

INSERT INTO `default_settings` (`id`, `position`, `department`, `nametitle`, `status_user`, `role_user`, `issue_type`, `issue_priority`, `level`, `screen_type`, `issue_status`, `developer_status`, `implement_status`) VALUES
(1, '', 'DD', 'Mr.', 'Active', 'User', 'PNI', 'Critical', 'ยากมาก', '', 'รอแก้ไข', 'รอแก้ไข', 'ตรวจสอบผ่าน'),
(2, 'Developer', 'SDD', 'Miss.', '', 'Admin', 'PNC', 'Hight', 'ยาก', '', 'กำลังแก้ไข', 'กำลังแก้ไข', 'ตรวจสอบไม่ผ่าน'),
(3, 'Implementer', NULL, 'นาย', '', 'Admin', 'New Req', 'Medium', 'ปานกลาง', '', 'แก้ไขเรียบร้อย', 'แก้ไขเรียบร้อย', NULL),
(4, 'Program Management', NULL, 'นาง', '', 'Admin', NULL, 'Low', 'ง่าย', '', 'ตรวจสอบผ่าน', 'แก้ไขไม่ได้', NULL),
(5, 'System Analyst', NULL, 'นางสาว', '', 'Admin', NULL, NULL, 'ง่ายมาก', 'Process', 'ตรวจสอบไม่ผ่าน', NULL, NULL),
(6, 'Report developer', NULL, '', '', 'Admin', NULL, NULL, '', 'Inquiry', NULL, NULL, NULL),
(7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Report UI', NULL, NULL, NULL),
(8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Report', NULL, NULL, NULL),
(9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sevice', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `history_issues`
--

CREATE TABLE `history_issues` (
  `id` int(11) NOT NULL,
  `screen_id` int(11) DEFAULT NULL,
  `system_id` int(11) DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  `issues_id` int(11) NOT NULL,
  `user_assign_id` int(11) DEFAULT NULL,
  `user_qc_id` int(11) DEFAULT NULL,
  `issue_name` varchar(50) DEFAULT NULL,
  `issue_id` varchar(50) DEFAULT NULL,
  `issue_type` varchar(10) DEFAULT NULL,
  `issue_informer` varchar(50) DEFAULT NULL,
  `issue_priority` varchar(10) DEFAULT NULL,
  `issue_end` date DEFAULT NULL,
  `issue_assign` varchar(50) DEFAULT NULL,
  `issue_qc` varchar(50) DEFAULT NULL,
  `issue_des` varchar(255) DEFAULT NULL,
  `issue_des_sa` varchar(255) DEFAULT NULL,
  `issue_doc_id` varchar(20) DEFAULT NULL,
  `issue_customer` varchar(50) DEFAULT NULL,
  `issue_filename` varchar(50) DEFAULT NULL,
  `issue_des_dev` varchar(255) DEFAULT NULL,
  `issue_des_implementer` varchar(255) DEFAULT NULL,
  `issue_start` date DEFAULT NULL,
  `issue_expected` date DEFAULT NULL,
  `issue_status` varchar(20) DEFAULT NULL,
  `issue_accepting` date DEFAULT NULL,
  `issue_manday` float DEFAULT NULL,
  `issue_status_developer` varchar(20) DEFAULT NULL,
  `issue_status_implement` varchar(20) DEFAULT NULL,
  `issue_round` float DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `issue_complete` date DEFAULT NULL,
  `issue_type_sa` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_updated` varchar(100) DEFAULT NULL,
  `user_position_updated` varchar(100) DEFAULT NULL,
  `user_id_updated` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `history_tasks`
--

CREATE TABLE `history_tasks` (
  `id` int(11) NOT NULL,
  `task_code` varchar(50) DEFAULT NULL,
  `task_name` varchar(100) DEFAULT NULL,
  `task_detail` varchar(256) DEFAULT NULL,
  `task_status` varchar(20) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `screen_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `system_id` int(11) DEFAULT NULL,
  `task_progress` decimal(10,0) DEFAULT NULL,
  `task_plan_start` date DEFAULT NULL,
  `task_plan_end` date DEFAULT NULL,
  `task_actual_start` date DEFAULT NULL,
  `task_actual_end` date DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT NULL,
  `task_member_id` int(11) DEFAULT NULL,
  `task_manday` float DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  `task_type` varchar(50) DEFAULT NULL,
  `user_update` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `id` int(11) NOT NULL,
  `screen_id` int(11) DEFAULT NULL,
  `system_id` int(11) DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  `user_assign_id` int(11) DEFAULT NULL,
  `user_qc_id` int(11) DEFAULT NULL,
  `issue_name` varchar(50) DEFAULT NULL,
  `issue_id` varchar(50) DEFAULT NULL,
  `issue_type` varchar(10) DEFAULT NULL,
  `issue_informer` varchar(50) DEFAULT NULL,
  `issue_priority` varchar(10) DEFAULT NULL,
  `issue_end` date DEFAULT NULL,
  `issue_assign` varchar(50) DEFAULT NULL,
  `issue_qc` varchar(50) DEFAULT NULL,
  `issue_des` varchar(255) DEFAULT NULL,
  `issue_des_sa` varchar(255) DEFAULT NULL,
  `issue_type_sa` varchar(255) DEFAULT NULL,
  `issue_doc_id` varchar(20) DEFAULT NULL,
  `issue_customer` varchar(50) DEFAULT NULL,
  `issue_des_dev` varchar(255) DEFAULT NULL,
  `issue_des_implementer` varchar(255) DEFAULT NULL,
  `issue_start` date DEFAULT NULL,
  `issue_expected` date DEFAULT NULL,
  `issue_status` varchar(20) DEFAULT NULL,
  `issue_accepting` date DEFAULT NULL,
  `issue_manday` float DEFAULT NULL,
  `issue_complete` varchar(100) DEFAULT NULL,
  `issue_status_developer` varchar(20) DEFAULT NULL,
  `issue_status_implement` varchar(20) DEFAULT NULL,
  `issue_round` float DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `issue_files_id` int(11) DEFAULT NULL,
  `issue_filename` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `project_name_TH` varchar(100) DEFAULT NULL,
  `project_name_ENG` varchar(100) NOT NULL,
  `project_progress` decimal(10,0) NOT NULL DEFAULT 0,
  `project_manday` float(10,0) DEFAULT NULL,
  `system_count` int(11) DEFAULT NULL,
  `project_plan_start` date DEFAULT NULL,
  `project_plan_end` date DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `projects`
--
DELIMITER $$
CREATE TRIGGER `delete_related_data` BEFORE DELETE ON `projects` FOR EACH ROW BEGIN
    -- Delete data from user_screens table
    DELETE FROM user_screens WHERE project_id = OLD.id;

    -- Delete data from user_systems table
    DELETE FROM user_systems WHERE project_id = OLD.id;

    -- Delete data from user_projects table
    DELETE FROM user_projects WHERE project_id = OLD.id;

    -- Delete data from history_issues table
    DELETE FROM history_issues WHERE project_id = OLD.id;
      -- Delete data from history_tasks table
    DELETE FROM history_tasks WHERE project_id = OLD.id;


    -- Delete data from issues table
    DELETE FROM issues WHERE project_id = OLD.id;

    -- Delete data from tasks table
    DELETE FROM tasks WHERE project_id = OLD.id;
    
    -- Delete data from screens table
    DELETE FROM screens WHERE project_id = OLD.id;

    -- Delete data from systems table
    DELETE FROM systems WHERE project_id = OLD.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `screens`
--

CREATE TABLE `screens` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `screen_code` varchar(50) NOT NULL,
  `screen_name` varchar(100) DEFAULT NULL,
  `screen_status` varchar(20) DEFAULT NULL,
  `screen_level` varchar(10) DEFAULT NULL,
  `screen_manday` float DEFAULT NULL,
  `screen_pic` longtext DEFAULT NULL,
  `screen_phase` varchar(50) DEFAULT NULL,
  `screen_progress` decimal(10,0) NOT NULL DEFAULT 0,
  `screen_progress_status_design` decimal(10,0) DEFAULT 0,
  `screen_progress_status_dev` decimal(10,0) DEFAULT 0,
  `screen_progress_status_testing` decimal(10,0) DEFAULT 0,
  `task_count` int(11) DEFAULT NULL,
  `screen_plan_start` date DEFAULT NULL,
  `screen_plan_end` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `screens`
--
DELIMITER $$
CREATE TRIGGER `delete_related_data_on_screen_delete` BEFORE DELETE ON `screens` FOR EACH ROW BEGIN
    -- Delete data from user_screens table
    DELETE FROM user_screens WHERE screen_id = OLD.id;

    -- Delete data from tasks table
    DELETE FROM tasks WHERE screen_id = OLD.id;

    -- Delete data from issues table
    DELETE FROM issues WHERE screen_id = OLD.id;

    -- Delete data from history_issues table
    DELETE FROM history_issues WHERE screen_id = OLD.id;
    
     -- Delete data from history_tasks table
    DELETE FROM history_tasks WHERE project_id = OLD.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `systems`
--

CREATE TABLE `systems` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `system_nameTH` varchar(100) NOT NULL,
  `system_nameEN` varchar(50) DEFAULT NULL,
  `system_shortname` varchar(50) DEFAULT NULL,
  `screen_count` int(11) DEFAULT 0,
  `system_manday` float DEFAULT 0,
  `system_progress` decimal(10,0) NOT NULL DEFAULT 0,
  `system_plan_start` date DEFAULT NULL,
  `system_plan_end` date DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `systems`
--
DELIMITER $$
CREATE TRIGGER `delete_related_data_on_system_delete` BEFORE DELETE ON `systems` FOR EACH ROW BEGIN
    -- Delete data from user_screens table
    DELETE FROM user_screens WHERE system_id = OLD.id;

    -- Delete data from user_systems table
    DELETE FROM user_systems WHERE system_id = OLD.id;

    -- Delete data from tasks table
    DELETE FROM tasks WHERE system_id = OLD.id;

    -- Delete data from issues table
    DELETE FROM issues WHERE system_id = OLD.id;

    -- Delete data from history_issues table
    DELETE FROM history_issues WHERE system_id = OLD.id;
    
     -- Delete data from history_tasks table
    DELETE FROM history_tasks WHERE project_id = OLD.id;

    -- Delete data from screens table
    DELETE FROM screens WHERE system_id = OLD.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `task_id` varchar(50) DEFAULT NULL,
  `task_name` varchar(100) DEFAULT NULL,
  `task_detail` varchar(256) DEFAULT NULL,
  `task_status` varchar(100) DEFAULT NULL,
  `task_manday` float DEFAULT NULL,
  `task_actual_manday` float DEFAULT NULL,
  `screen_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `task_type` varchar(50) DEFAULT NULL,
  `system_id` int(11) NOT NULL,
  `task_progress` decimal(10,0) NOT NULL DEFAULT 0,
  `task_plan_start` date DEFAULT NULL,
  `task_plan_end` date DEFAULT NULL,
  `task_actual_start` date DEFAULT NULL,
  `task_actual_end` date DEFAULT NULL,
  `task_member_id` int(11) DEFAULT NULL,
  `user_update` int(11) DEFAULT NULL,
  `task_date_update` datetime DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `tasks`
--
DELIMITER $$
CREATE TRIGGER `delete_history_tasks_trigger` BEFORE DELETE ON `tasks` FOR EACH ROW BEGIN
    -- Delete corresponding records from history_tasks table
    DELETE FROM history_tasks WHERE task_id = OLD.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_firstname` varchar(100) DEFAULT NULL,
  `user_lastname` varchar(100) DEFAULT NULL,
  `user_id` varchar(20) NOT NULL,
  `user_position` varchar(20) DEFAULT NULL,
  `user_department` varchar(20) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_password` varchar(20) DEFAULT NULL,
  `user_status` varchar(20) DEFAULT NULL,
  `user_role` varchar(20) DEFAULT NULL,
  `user_pic` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `delete_related_data_on_user_delete` BEFORE DELETE ON `users` FOR EACH ROW BEGIN
    -- Delete data from user_projects table
    DELETE FROM user_projects WHERE user_id = OLD.id;

    -- Delete data from user_screens table
    DELETE FROM user_screens WHERE user_id = OLD.id;

    -- Delete data from user_systems table
    DELETE FROM user_systems WHERE user_id = OLD.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_issues`
--

CREATE TABLE `user_issues` (
  `user_id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_projects`
--

CREATE TABLE `user_projects` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_screens`
--

CREATE TABLE `user_screens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `screen_id` int(11) DEFAULT NULL,
  `system_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_systems`
--

CREATE TABLE `user_systems` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `system_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `default_settings`
--
ALTER TABLE `default_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `history_issues`
--
ALTER TABLE `history_issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `system_id` (`system_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `screen_id` (`screen_id`),
  ADD KEY `issues_id` (`issues_id`),
  ADD KEY `user_assign_id` (`user_assign_id`),
  ADD KEY `user_qc_id` (`user_qc_id`);

--
-- Indexes for table `history_tasks`
--
ALTER TABLE `history_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `screen_id` (`screen_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `system_id` (`system_id`),
  ADD KEY `task_member_id` (`task_member_id`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `system_id` (`system_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `screen_id` (`screen_id`),
  ADD KEY `user_assign_id` (`user_assign_id`),
  ADD KEY `user_qc_id` (`user_qc_id`),
  ADD KEY `fk_issue_files_id` (`issue_files_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `screens`
--
ALTER TABLE `screens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `system_id` (`system_id`) USING BTREE;

--
-- Indexes for table `systems`
--
ALTER TABLE `systems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `screen_id` (`screen_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `system_id` (`system_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `history_tasks`
--
ALTER TABLE `history_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `history_tasks`
--
ALTER TABLE `history_tasks`
  ADD CONSTRAINT `history_tasks_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `history_tasks_ibfk_2` FOREIGN KEY (`screen_id`) REFERENCES `screens` (`id`),
  ADD CONSTRAINT `history_tasks_ibfk_3` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `history_tasks_ibfk_4` FOREIGN KEY (`system_id`) REFERENCES `systems` (`id`),
  ADD CONSTRAINT `history_tasks_ibfk_5` FOREIGN KEY (`task_member_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
