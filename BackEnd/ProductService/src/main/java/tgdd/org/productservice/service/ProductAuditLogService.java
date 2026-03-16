package tgdd.org.productservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tgdd.org.productservice.model.ProductAuditLog;

import java.time.LocalDateTime;

public interface ProductAuditLogService {

    Page<ProductAuditLog> getMasterLogs(Long productId, String accountId, String action,
                                        LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);

    Page<ProductAuditLog> getProductLogs(Long productId, Pageable pageable);
}
