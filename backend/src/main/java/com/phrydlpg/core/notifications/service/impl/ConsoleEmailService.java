package com.phrydlpg.core.notifications.service.impl;

import com.phrydlpg.core.notifications.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Service
@ConditionalOnProperty(name = "email.service.type", havingValue = "console", matchIfMissing = true)
public class ConsoleEmailService implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(ConsoleEmailService.class);

    @Override
    public void sendVerificationEmail(String to, String token) {
        logger.info("==============================================");
        logger.info("MOCK EMAIL SENT");
        logger.info("To: {}", to);
        logger.info("Subject: Verify Your PhrydlPG Account");
        logger.info("Body: Please click the link to verify: https://phrydlpg.com/verify?token={}", token);
        logger.info("==============================================");
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        logger.info("==============================================");
        logger.info("MOCK EMAIL SENT");
        logger.info("To: {}", to);
        logger.info("Subject: Reset Your PhrydlPG Password");
        logger.info("Body: Please click the link to reset: https://phrydlpg.com/reset?token={}", token);
        logger.info("==============================================");
    }

    @Override
    public void sendEmail(String to, String subject, String text) {
        logger.info("==============================================");
        logger.info("MOCK EMAIL SENT");
        logger.info("To: {}", to);
        logger.info("Subject: {}", subject);
        logger.info("Body: {}", text);
        logger.info("==============================================");
    }
}
