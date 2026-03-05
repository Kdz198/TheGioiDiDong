package tgdd.org.userservice.Service.Impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tgdd.org.userservice.Enum.Permission;
import tgdd.org.userservice.Model.DTO.Request.CreateRoleRequest;
import tgdd.org.userservice.Model.Role;
import tgdd.org.userservice.Repository.RoleRepository;
import tgdd.org.userservice.Service.RoleService;

import java.util.List;


@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void createRole(CreateRoleRequest request) {

        Role role = objectMapper.convertValue(request, Role.class);
        roleRepository.save(role);
    }

    @Override
    public void updateRole(Long roleId, CreateRoleRequest request) {

        if (!roleRepository.existsById(roleId)) {
            throw new RuntimeException("Role not found with id: " + roleId);
        }

        Role role = objectMapper.convertValue(request, Role.class);
        role.setId(roleId);
        roleRepository.save(role);

    }

    @Override
    public void deleteRole(Long roleId) {

        if (!roleRepository.existsById(roleId)) {
            throw new RuntimeException("Role not found with id: " + roleId);
        }
        roleRepository.deleteById(roleId);

    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public List<Permission> getAllPermission() {
        return List.of(Permission.values());
    }
}
