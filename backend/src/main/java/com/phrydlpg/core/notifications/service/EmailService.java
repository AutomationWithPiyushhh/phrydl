package com.phrydlpg.core.notifications.service;

public interface EmailService {
    void sendVerificationEmail(String to, String token);
    void sendPasswordResetEmail(String to, String token);
    void sendEmail(String to, String subject, String text);
}
