package tgdd.org.userservice.Model.DTO.Request;

import lombok.Data;

@Data
public class LoginRequest {
    String email;
    String password;
}
