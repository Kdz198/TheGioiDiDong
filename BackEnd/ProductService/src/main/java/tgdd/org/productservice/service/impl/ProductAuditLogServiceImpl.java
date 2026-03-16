package tgdd.org.productservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.ProductAuditLog;
import tgdd.org.productservice.repo.ProductAuditLogRepository;
import tgdd.org.productservice.service.ProductAuditLogService;
import tgdd.org.productservice.util.SpecBuilder;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductAuditLogServiceImpl implements ProductAuditLogService {

    private final ProductAuditLogRepository auditLogRepository;

    @Override
    public Page<ProductAuditLog> getMasterLogs(Long productId, String accountId, String action,
                                               LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {


        Specification<ProductAuditLog> spec = new SpecBuilder<ProductAuditLog>()
                .withEquals("productId", productId)
                .withEquals("accountId", accountId)
                .withLike("action", action)
                .withGreaterThanOrEqual("createdAt", fromDate)
                .withLessThanOrEqual("createdAt", toDate)
                .build();

        return auditLogRepository.findAll(spec, pageable);
    }

    @Override
    public Page<ProductAuditLog> getProductLogs(Long productId, Pageable pageable) {
        return auditLogRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }


}