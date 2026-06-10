package com.nexora.ai.scheduler;

import com.nexora.ai.entity.ReceivablesPayables;
import com.nexora.ai.repository.ReceivablesPayablesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class ScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);
    private final ReceivablesPayablesRepository repository;

    public ScheduledTasks(ReceivablesPayablesRepository repository) {
        this.repository = repository;
    }

    /**
     * Runs daily at 1:00 AM to scan for overdue invoices/bills.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void scanAndMarkOverduePayments() {
        log.info("Starting scheduled scan for overdue payments...");
        LocalDate today = LocalDate.now();
        List<ReceivablesPayables> pendingOverdue = repository.findByStatusAndDueDateBefore("PENDING", today);
        
        if (!pendingOverdue.isEmpty()) {
            for (ReceivablesPayables record : pendingOverdue) {
                record.setStatus("OVERDUE");
            }
            repository.saveAll(pendingOverdue);
            log.info("Scheduled task marked {} payments as OVERDUE.", pendingOverdue.size());
        } else {
            log.info("No overdue payments found during scheduled scan.");
        }
    }
}
