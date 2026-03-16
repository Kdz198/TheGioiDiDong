package tgdd.org.productservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tgdd.org.productservice.model.ProductAuditLog;
import tgdd.org.productservice.service.ProductAuditLogService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("api/products")
@RequiredArgsConstructor
public class ProductAuditLogController {

    private final ProductAuditLogService auditLogService;

    @GetMapping("audit-logs")
    public Page<ProductAuditLog> getMasterLogs(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            Pageable pageable) {

        return auditLogService.getMasterLogs(productId, accountId, action, fromDate, toDate, pageable);
    }

    @GetMapping("{productId}/audit-logs")
    public Page<ProductAuditLog> getProductLogs(@PathVariable Long productId, Pageable pageable) {

        return auditLogService.getProductLogs(productId, pageable);
    }
}
