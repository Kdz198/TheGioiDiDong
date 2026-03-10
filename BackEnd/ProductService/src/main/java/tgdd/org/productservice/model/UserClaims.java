package tgdd.org.productservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserClaims {
    private String email;
    private Long accountId;
    private String role;
    private List<String> permissions;
}
