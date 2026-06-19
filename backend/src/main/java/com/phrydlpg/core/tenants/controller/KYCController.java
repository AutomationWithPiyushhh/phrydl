package com.phrydlpg.core.tenants.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.common.service.StorageService;
import com.phrydlpg.core.tenants.entity.KYCDocument;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.KYCDocumentRepository;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kyc")
@RequiredArgsConstructor
public class KYCController {

    private final StorageService storageService;
    private final KYCDocumentRepository kycDocumentRepository;
    private final TenantRepository tenantRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('TENANT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<KYCDocument>> uploadDocument(
            @RequestParam("tenantId") UUID tenantId,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) {
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        String fileName = storageService.storeFile(file);
        
        // Generate download URL
        String fileDownloadUri = "/api/v1/kyc/download/" + fileName;

        KYCDocument doc = KYCDocument.builder()
                .tenant(tenant)
                .documentType(documentType)
                .documentUrl(fileDownloadUri)
                .status("PENDING")
                .build();

        kycDocumentRepository.save(doc);

        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", doc));
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = storageService.loadFileAsResource(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("hasAnyRole('TENANT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<KYCDocument>>> getTenantDocuments(@PathVariable UUID tenantId) {
        List<KYCDocument> docs = kycDocumentRepository.findByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved", docs));
    }

    @PutMapping("/{docId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<KYCDocument>> updateStatus(
            @PathVariable UUID docId,
            @RequestParam("status") String status) {
        
        KYCDocument doc = kycDocumentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        doc.setStatus(status);
        kycDocumentRepository.save(doc);
        
        // If all docs are verified, update tenant status
        if ("VERIFIED".equals(status)) {
            Tenant tenant = doc.getTenant();
            List<KYCDocument> allDocs = kycDocumentRepository.findByTenantId(tenant.getId());
            boolean allVerified = allDocs.stream().allMatch(d -> "VERIFIED".equals(d.getStatus()));
            if (allVerified) {
                tenant.setKycStatus("VERIFIED");
                tenantRepository.save(tenant);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, doc));
    }
}
