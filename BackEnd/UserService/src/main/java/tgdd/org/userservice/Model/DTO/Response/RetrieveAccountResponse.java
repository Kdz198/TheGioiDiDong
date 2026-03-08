package tgdd.org.userservice.Model.DTO.Response;

import lombok.Data;
import tgdd.org.userservice.Enum.Permission;
import tgdd.org.userservice.Model.Role;

import java.util.HashSet;
import java.util.Set;

@Data
public class RetrieveAccountResponse {

    private Long id;

    private String email;

    private String password;

    private String fullName;

    String roleName;

    boolean isActive;

    private Set<Permission> allPermissions = new HashSet<>();
}
