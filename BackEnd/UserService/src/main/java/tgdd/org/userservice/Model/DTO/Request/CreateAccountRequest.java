package tgdd.org.userservice.Model.DTO.Request;

import lombok.Data;
import tgdd.org.userservice.Enum.Permission;
import tgdd.org.userservice.Model.Role;

import java.util.HashSet;
import java.util.Set;

@Data
public class CreateAccountRequest {

    private String email;

    private String password;

    private String fullName;

    Long roleId;

    private Set<Permission> customPermissions = new HashSet<>();
}
