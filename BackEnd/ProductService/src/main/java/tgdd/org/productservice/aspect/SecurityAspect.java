package tgdd.org.productservice.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import tgdd.org.productservice.annotation.RequireAuth;
import tgdd.org.productservice.util.SecurityUtil;


@Aspect
@Component
@RequiredArgsConstructor
public class SecurityAspect {

    private final SecurityUtil securityUtil;


    @Before("@annotation(requireAuth)")
    public void checkSecurity(RequireAuth requireAuth) {

        // 1. Lấy Request hiện tại
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String authHeader = request.getHeader("Authorization");

        securityUtil.verifyTokenAndAuth(authHeader, requireAuth.roles(), requireAuth.permission());
    }
}