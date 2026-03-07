package tgdd.org.userservice.Service;

import tgdd.org.userservice.Model.DTO.Request.LoginRequest;
import tgdd.org.userservice.Model.DTO.Response.LoginResponse;

public interface AuthService {

    LoginResponse authenticate(LoginRequest request);
   void verifyTokenAndAuth(String authHeader, String[] requiredRoles, String requiredPermission);
}
