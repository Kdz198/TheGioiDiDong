package tgdd.org.userservice.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tgdd.org.userservice.Model.DTO.Request.CreateRoleRequest;
import tgdd.org.userservice.Model.Role;
import tgdd.org.userservice.Service.RoleService;

import java.util.List;

@RestController
@RequestMapping("/api/users/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public void createRole(@RequestBody CreateRoleRequest request) {
        roleService.createRole( request);
    }

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/permissions")
    public List<String> getAllPermissions() {
        return roleService.getAllPermission().stream().map(Enum::name).toList();
    }

    @PutMapping("/{roleId}")
    public void updateRole(@PathVariable Long roleId, @RequestBody CreateRoleRequest request) {
        roleService.updateRole(roleId, request);
    }

    @DeleteMapping("/{roleId}")
    public void deleteRole(@PathVariable Long roleId) {
        roleService.deleteRole(roleId);
    }

}
