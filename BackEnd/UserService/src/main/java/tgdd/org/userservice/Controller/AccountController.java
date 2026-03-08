package tgdd.org.userservice.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import tgdd.org.userservice.Model.DTO.Request.CreateAccountRequest;
import tgdd.org.userservice.Model.DTO.Response.RetrieveAccountResponse;
import tgdd.org.userservice.Service.AccountService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("{id}")
    RetrieveAccountResponse getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    @GetMapping
    Page<RetrieveAccountResponse> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return accountService.getAllAccounts(page, size);
    }

    @PostMapping
    void createAccount(@RequestBody CreateAccountRequest request) {
        accountService.createAccount(request);
    }

    @PutMapping("/{id}")
    void updateAccount(@PathVariable Long id, @RequestBody CreateAccountRequest request) {
        accountService.updateAccount(id, request);
    }

    @DeleteMapping("/{id}")
    void deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
    }
}
