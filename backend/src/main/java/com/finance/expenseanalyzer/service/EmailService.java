package com.finance.expenseanalyzer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@centricai.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            // Fail silently or log error, but do not crash request
        }
    }

    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to CentricAI — Your AI Financial Copilot";
        String body = String.format("Hello %s,\n\nWelcome to CentricAI! We are thrilled to help you analyze, optimize, and forecast your personal finance journey.\n\nBest regards,\nThe CentricAI Team", name);
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Reset Your CentricAI Password";
        String body = String.format("Hello,\n\nPlease use the link below to reset your password:\n%s\n\nIf you did not request this, please ignore this email.", resetLink);
        sendEmail(to, subject, body);
    }

    public void sendBudgetAlert(String to, String budgetName, double thresholdPercent, double currentSpent, double limit) {
        String subject = String.format("ALERT: Budget Limit Warning for %s", budgetName);
        String body = String.format("Hello,\n\nThis is an automated alert from CentricAI.\nYou have spent %.2f out of your %.2f limit on %s (%.1f%% of your budget).\n\nPlease review your expenses in the application.\n\nBest regards,\nThe CentricAI Team", currentSpent, limit, budgetName, thresholdPercent * 100);
        sendEmail(to, subject, body);
    }

    public void sendGoalProgressAlert(String to, String goalName, double targetAmount, double currentSaved) {
        String subject = String.format("Goal Update: %s Progress", goalName);
        String body = String.format("Hello,\n\nYou're making progress on your goal '%s'!\nYou have saved %.2f out of your %.2f target.\nKeep up the great work!\n\nBest regards,\nThe CentricAI Team", goalName, currentSaved, targetAmount);
        sendEmail(to, subject, body);
    }
}
