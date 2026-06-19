package com.phrydlpg.core.expenses.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.expenses.dto.ExpenseDto;
import com.phrydlpg.core.expenses.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<List<ExpenseDto>> getAllExpenses() {
        return ApiResponse.success("Expenses retrieved successfully", expenseService.getAllExpenses());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<com.phrydlpg.core.expenses.dto.ExpenseStatsDto> getExpenseStats() {
        return ApiResponse.success("Expense stats retrieved successfully", expenseService.getExpenseStats());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<ExpenseDto> createExpense(@RequestBody ExpenseDto dto) {
        return ApiResponse.success("Expense created successfully", expenseService.createExpense(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<ExpenseDto> updateExpense(@PathVariable UUID id, @RequestBody ExpenseDto dto) {
        return ApiResponse.success("Expense updated successfully", expenseService.updateExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<Void> deleteExpense(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ApiResponse.success("Expense deleted successfully", null);
    }

}
