package tgdd.org.userservice.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tgdd.org.userservice.Model.DTO.Request.LoginRequest;
import tgdd.org.userservice.Model.DTO.Response.LoginResponse;
import tgdd.org.userservice.Service.AuthService;

@RestController
@RequestMapping("api/users/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("login")
    public LoginResponse login (@RequestBody LoginRequest request) {
        return authService.authenticate(request);
    }
}
