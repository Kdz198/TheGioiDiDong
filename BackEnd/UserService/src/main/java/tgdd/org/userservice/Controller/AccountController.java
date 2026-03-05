package tgdd.org.userservice.Controller;

import lombok.RequiredArgsConstructor;
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
    List<RetrieveAccountResponse> getAllAccounts() {
        return accountService.getAllAccounts();
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
