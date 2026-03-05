package tgdd.org.userservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.userservice.Model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

}
