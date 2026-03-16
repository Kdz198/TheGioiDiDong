package tgdd.org.productservice.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import tgdd.org.productservice.model.ProductAuditLog;


public interface ProductAuditLogRepository extends JpaRepository<ProductAuditLog, Long>, JpaSpecificationExecutor<ProductAuditLog> {


    Page<ProductAuditLog> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
}