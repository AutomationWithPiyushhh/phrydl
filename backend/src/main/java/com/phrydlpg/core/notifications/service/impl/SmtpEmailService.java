package com.phrydlpg.core.notifications.service.impl;

import com.phrydlpg.core.notifications.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "email.service.type", havingValue = "smtp")
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;

    @Async
    @Override
    public void sendVerificationEmail(String to, String token) {
        sendEmail(to, "Verify Your PhrydlPG Account", "Please click the link to verify: https://phrydlpg.com/verify?token=" + token);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String token) {
        sendEmail(to, "Reset Your PhrydlPG Password", "Please click the link to reset: https://phrydlpg.com/reset?token=" + token);
    }

    @Async
    @Override
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendEmail(String to, String subject, String text) {
        log.info("Attempting to send email to {}", to);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("noreply@phrydlpg.com");
        
        mailSender.send(message);
        log.info("Email sent successfully to {}", to);
    }
}
