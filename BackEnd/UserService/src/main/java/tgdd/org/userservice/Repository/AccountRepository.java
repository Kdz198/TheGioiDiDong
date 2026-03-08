package tgdd.org.userservice.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.userservice.Model.Account;

import java.util.List;
import java.util.Optional;

public interface AccountRepository  extends JpaRepository<Account, Long> {
   Optional<Account> findByEmail(String email);
   Page<Account> findByRole_NameIn(List<String> roles, Pageable pageable);
}
