package tgdd.org.userservice.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.userservice.Model.Account;

import java.util.Optional;

public interface AccountRepository  extends JpaRepository<Account, Long> {
   Optional<Account> findByEmail(String email);
}
