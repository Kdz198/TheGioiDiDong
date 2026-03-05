package tgdd.org.userservice.Service;

import tgdd.org.userservice.Enum.Permission;
import tgdd.org.userservice.Model.DTO.Request.CreateRoleRequest;
import tgdd.org.userservice.Model.Role;

import java.util.List;

public interface RoleService {

    void createRole(CreateRoleRequest request);

    void updateRole(Long roleId, CreateRoleRequest request);

    void deleteRole(Long roleId);

    List<Role> getAllRoles();

List<Permission> getAllPermission();
}
