package tgdd.org.userservice.Aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import tgdd.org.userservice.Annotation.RequireAuth;
import tgdd.org.userservice.Service.AuthService;


@Aspect
@Component
@RequiredArgsConstructor
public class SecurityAspect {


    private final AuthService authService;

    @Before("@annotation(requireAuth)")
    public void checkSecurity(RequireAuth requireAuth) {

        // 1. Lấy Request hiện tại
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String authHeader = request.getHeader("Authorization");

        authService.verifyTokenAndAuth(authHeader, requireAuth.roles(), requireAuth.permission());
    }
}