package com.phrydlpg.core.expenses.repository;
import com.phrydlpg.core.expenses.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT SUM(e.amount) FROM Expense e WHERE e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    java.math.BigDecimal sumTotalExpensesBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(e.amount) FROM Expense e WHERE e.status = :status AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    java.math.BigDecimal sumExpensesByStatusAndDateBetween(@org.springframework.data.repository.query.Param("status") String status, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
}
