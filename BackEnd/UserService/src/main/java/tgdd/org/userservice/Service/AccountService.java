package tgdd.org.userservice.Service;

import tgdd.org.userservice.Model.DTO.Request.CreateAccountRequest;
import tgdd.org.userservice.Model.DTO.Response.RetrieveAccountResponse;

import java.util.List;

public interface AccountService {

    void createAccount(CreateAccountRequest request);

    void deleteAccount(Long id);

    void updateAccount(Long id, CreateAccountRequest request);

    RetrieveAccountResponse getAccountById(Long id);

    List<RetrieveAccountResponse> getAllAccounts();
}
