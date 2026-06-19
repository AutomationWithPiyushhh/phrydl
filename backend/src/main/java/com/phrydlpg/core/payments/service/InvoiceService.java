package com.phrydlpg.core.payments.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.phrydlpg.core.payments.entity.Invoice;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final TenantRepository tenantRepository;


    public byte[] generateInvoicePdf(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);

            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Paragraph title = new Paragraph("PhrydlPG Invoice", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);

            addCell(table, "Invoice Number:"); addCell(table, invoice.getInvoiceNumber());
            addCell(table, "Billing Month:"); addCell(table, invoice.getBillingMonth());
            addCell(table, "Tenant Name:"); addCell(table, invoice.getTenant().getUser().getFirstName() + " " + invoice.getTenant().getUser().getLastName());
            addCell(table, "Property:"); addCell(table, invoice.getProperty().getName());
            if (invoice.getTenant().getBed() != null) {
                addCell(table, "Room & Bed:"); addCell(table, invoice.getTenant().getBed().getRoom().getRoomNumber() + " - " + invoice.getTenant().getBed().getBedNumber());
            }
            addCell(table, "Rent Amount:"); addCell(table, "Rs. " + invoice.getAmount().toString());
            addCell(table, "Late Fees:"); addCell(table, "Rs. " + invoice.getLateFeeApplied().toString());
            addCell(table, "Total Amount:"); addCell(table, "Rs. " + invoice.getTotalAmount().toString());
            addCell(table, "Due Date:"); addCell(table, invoice.getDueDate().toString());
            addCell(table, "Status:"); addCell(table, invoice.getStatus().name());
            addCell(table, "Generated Date:"); addCell(table, invoice.getCreatedAt() != null ? invoice.getCreatedAt().toLocalDate().toString() : LocalDate.now().toString());

            document.add(table);
            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setPadding(8);
        table.addCell(cell);
    }
}
