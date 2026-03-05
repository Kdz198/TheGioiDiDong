package tgdd.org.userservice.Model.DTO.Request;

import lombok.Data;
import tgdd.org.userservice.Enum.Permission;

import java.util.Set;

@Data
public class CreateRoleRequest {

    private String name; // "STAFF", "ADMIN", "USER"

    private String description;

    Set<Permission> permissions;
}
