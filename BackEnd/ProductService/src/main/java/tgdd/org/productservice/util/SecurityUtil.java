package tgdd.org.productservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import tgdd.org.productservice.exception.CustomException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Component
public class SecurityUtil {

    @Value("${JWT_SECRECT:this_is_fake}")
    private String SECRET;

    private  SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public void verifyTokenAndAuth(String authHeader, String[] requiredRoles, String requiredPermission) {
        // 1. Kiểm tra Header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("UNAUTHORIZED - Vui lòng gửi kèm Token hợp lệ!");
        }

        String token = authHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new CustomException("UNAUTHORIZED - Token không hợp lệ hoặc đã hết hạn!", HttpStatus.UNAUTHORIZED);
        }

        // 3. Lấy thông tin từ Payload
        String tokenRole = claims.get("role", String.class);
        // JJWT tự động map mảng JSON thành List
        List<String> tokenPermissions = claims.get("permissions", List.class);

        // 4. Kiểm tra Role (Nếu Annotation có yêu cầu)
        if (requiredRoles.length > 0) {
            // Nếu role của user KHÔNG nằm trong mảng requiredRoles -> Chặn
            if (!Arrays.asList(requiredRoles).contains(tokenRole)) {
                throw new CustomException("UNAUTHORIZED - Bạn không có quyền truy cập!", HttpStatus.UNAUTHORIZED);
            }
        }

        // 5. Kiểm tra Permission (Nếu Annotation có yêu cầu)
        if (!requiredPermission.isEmpty()) {
            if (tokenPermissions == null || !tokenPermissions.contains(requiredPermission)) {
                throw new CustomException("UNAUTHORIZED - Bạn không có quyền truy cập!", HttpStatus.UNAUTHORIZED);
            }
        }
    }
}
