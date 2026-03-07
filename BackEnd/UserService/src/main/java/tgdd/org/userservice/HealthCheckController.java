package tgdd.org.userservice;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tgdd.org.userservice.Annotation.RequireAuth;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Test Authorization API", description = "Bộ API dùng để kiểm thử luồng phân quyền Custom AOP (Role & Permission)")
public class HealthCheckController {


//    @GetMapping("health-check")
//    public String healthCheckV1() {
//        return "User Service is healthy! (v1)";
//    }
//
//    @GetMapping("health")
//    public String healthCheck() {
//        return "User Service is healthy!";
//        }

    // ==========================================
    // CASE 1: PUBLIC (Không cần đăng nhập)
    // ==========================================
    @Operation(summary = "API Public (Mở hoàn toàn)", description = "Ai cũng có thể vào đây, không cần gửi kèm Token.")
    @GetMapping("/public")
    public String publicEndpoint() {
        return "1. [PUBLIC] - Ai cũng có thể vào đây, không cần gửi Token.";
    }

    // ==========================================
    // CASE 2: YÊU CẦU 1 ROLE CỤ THỂ
    // ==========================================
    @Operation(summary = "Dành riêng cho ADMIN", description = "Yêu cầu Token phải có Role là ADMIN.")
    @RequireAuth(roles = {"ADMIN"})
    @GetMapping("/admin-only")
    public String adminOnly() {
        return "2. [ADMIN ONLY] - Chào mừng sếp! Bạn đang có Role ADMIN.";
    }

    @Operation(summary = "Dành riêng cho STAFF", description = "Yêu cầu Token phải có Role là STAFF.")
    @RequireAuth(roles = {"STAFF"})
    @GetMapping("/staff-only")
    public String staffOnly() {
        return "2. [STAFF ONLY] - Chào nhân viên! Bạn đang có Role STAFF.";
    }

    @Operation(summary = "Dành riêng cho USER", description = "Yêu cầu Token phải có Role là USER.")
    @RequireAuth(roles = {"USER"})
    @GetMapping("/user-only")
    public String userOnly() {
        return "2. [USER ONLY] - Chào khách hàng! Bạn đang có Role USER.";
    }

    // ==========================================
    // CASE 3: CHẤP NHẬN NHIỀU ROLE CÙNG LÚC (HOẶC)
    // ==========================================
    @Operation(summary = "Dành cho Team Quản lý (ADMIN hoặc STAFF)", description = "Khách hàng (USER) gọi vào đây sẽ bị chặn.")
    @RequireAuth(roles = {"ADMIN", "STAFF"})
    @GetMapping("/management-team-admin-staff")
    public String managementTeam() {
        return "3. [ADMIN / STAFF] - Bạn là Admin hoặc Staff nên được phép vào đây (Khách hàng sẽ bị chặn).";
    }

    // ==========================================
    // CASE 4: CHỈ YÊU CẦU QUYỀN (KHÔNG QUAN TÂM ROLE)
    // ==========================================
    @Operation(summary = "Yêu cầu quyền VIEW_REVENUE_REPORT", description = "Bất chấp bạn là Role gì, miễn trong Token có quyền này là qua ải.")
    @RequireAuth(permission = "VIEW_REVENUE_REPORT")
    @GetMapping("/revenue-report")
    public String permissionOnly() {
        return "4. [PERMISSION ONLY] - Bạn có quyền xem báo cáo doanh thu. (Role gì cũng được, miễn trong Token có quyền này).";
    }

    // ==========================================
    // CASE 5: KẾT HỢP ROLE + QUYỀN GỐC
    // ==========================================
    @Operation(summary = "Yêu cầu STAFF và có quyền DELETE_PRODUCT", description = "Test trường hợp Staff được cấp quyền nâng cao.")
    @RequireAuth(roles = {"STAFF"}, permission = "DELETE_PRODUCT")
    @GetMapping("/staff-update-product")
    public String staffWithPermission() {
        return "5. [STAFF + PERMISSION] - Bạn là STAFF VIP được cấp quyền DELETE_PRODUCT nên có thể xóa sản phẩm!";
    }

    // ==========================================
    // CASE 6: TEST QUYỀN NGOẠI LỆ (CUSTOM PERMISSIONS TỪ JSONB)
    // ==========================================
    @Operation(summary = "Yêu cầu USER và có quyền ACCESS_VIP_DISCOUNTS", description = "Test trường hợp User thường được cấp thêm quyền đặc biệt ở cột JSONB.")
    @RequireAuth(roles = {"USER"}, permission = "ACCESS_VIP_DISCOUNTS")
    @GetMapping("/user-vip-review")
    public String userVipReview() {
        return "6. [USER + CUSTOM PERMISSION] - Bạn là USER VIP được cấp quyền ACCESS_VIP_DISCOUNTS nên có quyền truy cập ưu đãi VIP!";
    }
}
