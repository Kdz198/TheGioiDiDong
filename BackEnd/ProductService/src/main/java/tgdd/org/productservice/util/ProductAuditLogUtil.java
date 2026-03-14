package tgdd.org.productservice.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.model.ProductAuditLog;
import tgdd.org.productservice.model.UserClaims;
import tgdd.org.productservice.repo.ProductAuditLogRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class ProductAuditLogUtil {

    private final ProductAuditLogRepository productAuditLogRepository;
    private final SecurityUtil securityUtil;

    private Map<String, Object> buildChange(Object oldVal, Object newVal) {
        Map<String, Object> map = new HashMap<>();
        map.put("old", oldVal); // HashMap cho phép null thoải mái
        map.put("new", newVal);
        return map;
    }

    public void logProductUpdate(Product oldProduct, Product newProduct, String action) {

        UserClaims currentUser;
        try {
            currentUser = securityUtil.getCurrentUser();
        } catch (Exception e) {
            currentUser = new UserClaims(" system@gmail.com", -1L, "SYSTEM", List.of());
        }

        Map<String, Object> changes = new HashMap<>();

        boolean isCreate = (oldProduct == null);

        String oldName = isCreate ? null : oldProduct.getName();
        if (!Objects.equals(oldName, newProduct.getName())) {
            changes.put("name", buildChange(oldName, newProduct.getName()));
        }

        String oldDesc = isCreate ? null : oldProduct.getDescription();
        if (!Objects.equals(oldDesc, newProduct.getDescription())) {
            changes.put("description", buildChange(oldDesc, newProduct.getDescription()));
        }

        Integer oldPrice = isCreate ? null : oldProduct.getPrice();
        if (!Objects.equals(oldPrice, newProduct.getPrice())) {
            changes.put("price", buildChange(oldPrice, newProduct.getPrice()));
        }

        Integer oldQty = isCreate ? null : oldProduct.getQuantity();
        if (!Objects.equals(oldQty, newProduct.getQuantity())) {
            changes.put("quantity", buildChange(oldQty, newProduct.getQuantity()));
        }

        Integer oldReserve = isCreate ? null : oldProduct.getReserve();
        if (!Objects.equals(oldReserve, newProduct.getReserve())) {
            changes.put("reserve", buildChange(oldReserve, newProduct.getReserve()));
        }

        Boolean oldActive = isCreate ? null : oldProduct.isActive();
        if (!Objects.equals(oldActive, newProduct.isActive())) {
            changes.put("active", buildChange(oldActive, newProduct.isActive()));
        }

        Boolean oldType = isCreate ? null : oldProduct.isType();
        if (!Objects.equals(oldType, newProduct.isType())) {
            changes.put("type", buildChange(oldType, newProduct.isType()));
        }

        // ĐÃ SỬA: Thay 5 field imgUrl thành 1 field imgUrls (List)
        List<String> oldImgUrls = isCreate ? null : oldProduct.getImgUrls();
        if (!Objects.equals(oldImgUrls, newProduct.getImgUrls())) {
            changes.put("imgUrls", buildChange(oldImgUrls, newProduct.getImgUrls()));
        }

        Integer oldCategoryId = (isCreate || oldProduct.getCategory() == null) ? null : oldProduct.getCategory().getId();
        Integer newCategoryId = (newProduct.getCategory() == null) ? null : newProduct.getCategory().getId();
        if (!Objects.equals(oldCategoryId, newCategoryId)) {
            changes.put("categoryId", buildChange(oldCategoryId, newCategoryId));
        }

        Integer oldBrandId = (isCreate || oldProduct.getBrand() == null) ? null : oldProduct.getBrand().getId();
        Integer newBrandId = (newProduct.getBrand() == null) ? null : newProduct.getBrand().getId();
        if (!Objects.equals(oldBrandId, newBrandId)) {
            changes.put("brandId", buildChange(oldBrandId, newBrandId));
        }

        Integer oldVersionId = (isCreate || oldProduct.getVersion() == null) ? null : oldProduct.getVersion().getId();
        Integer newVersionId = (newProduct.getVersion() == null) ? null : newProduct.getVersion().getId();
        if (!Objects.equals(oldVersionId, newVersionId)) {
            changes.put("versionId", buildChange(oldVersionId, newVersionId));
        }

        // Lưu log nếu có sự thay đổi hoặc đây là hành động tạo mới
        if (!changes.isEmpty() || "CREATE".equals(action)) {
            ProductAuditLog log = new ProductAuditLog();

            log.setProductId((long) newProduct.getId());
            log.setAction(action);
            log.setAccountId(currentUser.getAccountId());
            log.setActorEmail(currentUser.getEmail());

            log.setChanges(changes);

            productAuditLogRepository.save(log);
        }
    }
}