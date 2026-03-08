package tgdd.org.userservice.Model.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String type;
    private String message;
    private String role;
    private long ttl;
    private long expiresIn; // Mốc thời gian Token chết (Unix Timestamp)
}
