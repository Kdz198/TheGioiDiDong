package tgdd.org.userservice.Service.Impl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import tgdd.org.userservice.Enum.Permission;
import tgdd.org.userservice.Exception.CustomException;
import tgdd.org.userservice.Model.Account;
import tgdd.org.userservice.Model.DTO.Request.LoginRequest;
import tgdd.org.userservice.Model.DTO.Response.LoginResponse;
import tgdd.org.userservice.Repository.AccountRepository;
import tgdd.org.userservice.Service.AuthService;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;

    @Value("${JWT_SECRECT:this_is_fake}")
    private String SECRET;
    private final long EXPIRATION_TIME = 86400000; // 1 ngày

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    // Hàm duy nhất xử lý toàn bộ luồng đăng nhập
    public LoginResponse authenticate(LoginRequest request) {

        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND));

        if (!account.isActive()) {
            throw new CustomException("Tài khoản đã bị vô hiệu hóa", HttpStatus.FORBIDDEN);
        }

        if (!account.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        Set<Permission> totalPermissions = new HashSet<>();
        if (account.getRole() != null && account.getRole().getPermissions() != null) {
            totalPermissions.addAll(account.getRole().getPermissions());
        }
        if (account.getCustomPermissions() != null) {
            totalPermissions.addAll(account.getCustomPermissions());
        }

        Set<String> permissionStrings = totalPermissions.stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        String roleName = account.getRole().getName();

        String token = Jwts.builder()
                .subject(account.getEmail())
                .claim("accountId", account.getId())
                .claim("role", roleName)
                .claim("permissions", permissionStrings)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();

        long ttlInSeconds = EXPIRATION_TIME / 1000;
        long expiresInTimestamp = System.currentTimeMillis() + EXPIRATION_TIME;

        return LoginResponse.builder()
                .token(token)
                .role( roleName)
                .type("Bearer")
                .message("Đăng nhập thành công!")
                .ttl(ttlInSeconds)
                .expiresIn(expiresInTimestamp)
                .build();
    }


    @Override
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
