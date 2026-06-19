package com.phrydlpg.core.system.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class BackupService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Scheduled(cron = "0 0 2 * * ?")
    public void performBackup() {
        log.info("Starting database backup process...");

        String dbName = extractDbName(dbUrl);
        String host = extractHost(dbUrl);
        String port = extractPort(dbUrl);

        File backupDir = new File("backups");
        if (!backupDir.exists()) {
            backupDir.mkdirs();
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String backupFileName = "backups/pg_backup_" + dbName + "_" + timestamp + ".sql";

        ProcessBuilder processBuilder = new ProcessBuilder(
                "pg_dump",
                "-h", host,
                "-p", port,
                "-U", dbUser,
                "-F", "c",
                "-b",
                "-v",
                "-f", backupFileName,
                dbName
        );

        processBuilder.environment().put("PGPASSWORD", dbPassword);

        try {
            Process process = processBuilder.start();
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                log.info("Database backup completed successfully. Saved to {}", backupFileName);
            } else {
                log.error("Database backup failed with exit code {}", exitCode);
            }
        } catch (IOException | InterruptedException e) {
            log.error("Error during database backup", e);
            Thread.currentThread().interrupt();
        }
    }

    private String extractDbName(String url) {
        return url.substring(url.lastIndexOf("/") + 1).split("\\?")[0];
    }

    private String extractHost(String url) {
        String cleanUrl = url.replace("jdbc:postgresql://", "");
        return cleanUrl.substring(0, cleanUrl.indexOf(":"));
    }

    private String extractPort(String url) {
        String cleanUrl = url.replace("jdbc:postgresql://", "");
        String afterHost = cleanUrl.substring(cleanUrl.indexOf(":") + 1);
        return afterHost.substring(0, afterHost.indexOf("/"));
    }
}
