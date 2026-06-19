package com.phrydlpg.core.expenses.service;

import com.phrydlpg.core.expenses.dto.ExpenseDto;
import com.phrydlpg.core.expenses.entity.Expense;
import com.phrydlpg.core.expenses.repository.ExpenseRepository;
import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final PropertyRepository propertyRepository;
    private final com.phrydlpg.core.common.repository.AuditLogRepository auditLogRepository;

    public List<ExpenseDto> getAllExpenses() {
        return expenseRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ExpenseDto createExpense(ExpenseDto dto) {
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        Expense expense = Expense.builder()
                .property(property)
                .title(dto.getTitle())
                .category(dto.getCategory())
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .expenseDate(dto.getExpenseDate())
                .status(dto.getStatus() != null ? dto.getStatus() : "PAID")
                .billUrl(dto.getBillUrl())
                .build();
        
        Expense savedExpense = expenseRepository.save(expense);
        
        com.phrydlpg.core.common.entity.AuditLog auditLog = com.phrydlpg.core.common.entity.AuditLog.builder()
                .entityType("EXPENSE")
                .entityId(savedExpense.getId().toString())
                .action("CREATED")
                .details("Expense created for " + savedExpense.getAmount() + " - " + savedExpense.getTitle())
                .performedBy("SYSTEM")
                .build();
        auditLogRepository.save(auditLog);

        return mapToDto(savedExpense);
    }

    public ExpenseDto updateExpense(UUID id, ExpenseDto dto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));

        if (dto.getPropertyId() != null) {
            Property property = propertyRepository.findById(dto.getPropertyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
            expense.setProperty(property);
        }

        if (dto.getTitle() != null) expense.setTitle(dto.getTitle());
        if (dto.getCategory() != null) expense.setCategory(dto.getCategory());
        if (dto.getAmount() != null) expense.setAmount(dto.getAmount());
        if (dto.getDescription() != null) expense.setDescription(dto.getDescription());
        if (dto.getExpenseDate() != null) expense.setExpenseDate(dto.getExpenseDate());
        if (dto.getStatus() != null) expense.setStatus(dto.getStatus());
        if (dto.getBillUrl() != null) expense.setBillUrl(dto.getBillUrl());

        Expense updatedExpense = expenseRepository.save(expense);

        com.phrydlpg.core.common.entity.AuditLog auditLog = com.phrydlpg.core.common.entity.AuditLog.builder()
                .entityType("EXPENSE")
                .entityId(updatedExpense.getId().toString())
                .action("UPDATED")
                .details("Expense updated - " + updatedExpense.getTitle())
                .performedBy("SYSTEM")
                .build();
        auditLogRepository.save(auditLog);

        return mapToDto(updatedExpense);
    }

    public void deleteExpense(UUID id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found");
        }
        expenseRepository.deleteById(id);

        com.phrydlpg.core.common.entity.AuditLog auditLog = com.phrydlpg.core.common.entity.AuditLog.builder()
                .entityType("EXPENSE")
                .entityId(id.toString())
                .action("DELETED")
                .details("Expense deleted")
                .performedBy("SYSTEM")
                .build();
        auditLogRepository.save(auditLog);
    }

    public com.phrydlpg.core.expenses.dto.ExpenseStatsDto getExpenseStats() {
        java.time.LocalDate startOfMonth = java.time.LocalDate.now().withDayOfMonth(1);
        java.time.LocalDate endOfMonth = java.time.LocalDate.now().withDayOfMonth(java.time.YearMonth.now().lengthOfMonth());

        java.math.BigDecimal totalExpenses = expenseRepository.sumTotalExpensesBetween(startOfMonth, endOfMonth);
        java.math.BigDecimal paidExpenses = expenseRepository.sumExpensesByStatusAndDateBetween("PAID", startOfMonth, endOfMonth);
        java.math.BigDecimal pendingExpenses = expenseRepository.sumExpensesByStatusAndDateBetween("PENDING", startOfMonth, endOfMonth);

        return com.phrydlpg.core.expenses.dto.ExpenseStatsDto.builder()
                .totalExpenses(totalExpenses != null ? totalExpenses : java.math.BigDecimal.ZERO)
                .paidExpenses(paidExpenses != null ? paidExpenses : java.math.BigDecimal.ZERO)
                .pendingExpenses(pendingExpenses != null ? pendingExpenses : java.math.BigDecimal.ZERO)
                .build();
    }

    private ExpenseDto mapToDto(Expense expense) {
        return ExpenseDto.builder()
                .id(expense.getId())
                .propertyId(expense.getProperty().getId())
                .propertyName(expense.getProperty().getName())
                .title(expense.getTitle())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .status(expense.getStatus())
                .billUrl(expense.getBillUrl())
                .build();
    }
}
