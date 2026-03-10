package tgdd.org.userservice.Service.Impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tgdd.org.userservice.Enum.Permission;
import tgdd.org.userservice.Model.Account;
import tgdd.org.userservice.Model.DTO.Request.CreateAccountRequest;
import tgdd.org.userservice.Model.DTO.Response.RetrieveAccountResponse;
import tgdd.org.userservice.Model.Role;
import tgdd.org.userservice.Repository.AccountRepository;
import tgdd.org.userservice.Repository.RoleRepository;
import tgdd.org.userservice.Service.AccountService;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void createAccount(CreateAccountRequest request) {

        Account account = objectMapper.convertValue(request, Account.class);
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + request.getRoleId()));
        account.setRole(role);
        accountRepository.save(account);
    }

    @Override
    public void deleteAccount(Long id) {

        accountRepository.deleteById(id);
    }

    @Override
    public void updateAccount(Long id, CreateAccountRequest request) {

        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Account not found with id: " + id);
        }

        Account account = objectMapper.convertValue(request, Account.class);
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + request.getRoleId()));
        account.setRole(role);
        account.setId(id);
        accountRepository.save(account);

    }

    @Override
    public RetrieveAccountResponse getAccountById(Long id) {

        return convertToResponse(accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id)));
    }

    @Override
    public Page<RetrieveAccountResponse> getAllAccounts(List<String> roles, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Account> accounts;

        if (roles == null || roles.isEmpty()) {
            accounts = accountRepository.findAll(pageable);
        } else {
            accounts = accountRepository.findByRole_NameIn(roles, pageable);
        }

        return accounts.map(this::convertToResponse);
    }

    @Override
    public String getNameAccount(long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id))
                .getFullName();
    }

    RetrieveAccountResponse convertToResponse(Account account) {
        RetrieveAccountResponse response = objectMapper.convertValue(account, RetrieveAccountResponse.class);
        response.setRoleName(account.getRole().getName());
        Set<Permission> permissions = account.getCustomPermissions();

        permissions.addAll(account.getRole().getPermissions());
        response.setActive( account.isActive());
        response.setAllPermissions(permissions);
        return response;
    }
}
