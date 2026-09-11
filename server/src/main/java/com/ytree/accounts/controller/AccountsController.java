package com.ytree.accounts.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ytree.accounts.model.Account;
import com.ytree.accounts.model.Statement;
import com.ytree.accounts.service.AccountsService;
import com.ytree.accounts.service.ProvidersService;

@RestController 
public class AccountsController {

  private final AccountsService accountService;
  private final ProvidersService providersService;
  public record StatementRequest(String fileName, LocalDate uploadedAt) {}
  public record AddAccountRequest(Long providerId) {}
  public record AccountResponse(Long id, Long providerId, String providerName, Statement statement) {}

  public AccountsController(AccountsService accountService, ProvidersService providersService) {
    this.accountService = accountService;
    this.providersService = providersService;
  }

  @GetMapping("/api/accounts/is-submitted")
  public boolean isSubmitted() {
    return accountService.isSubmitted();
  }

  @GetMapping("/api/accounts")
  public List<AccountResponse> getAccounts() {
    return accountService.getAllAccounts().stream().map(this::toResponse).toList();
  }

  @PostMapping("/api/accounts")
  public AccountResponse addAccount(@RequestBody AddAccountRequest request) {
    var provider = providersService.getProvider(request.providerId());
    return toResponse(accountService.addAccount(provider.id()));
  }

  @DeleteMapping("/api/accounts/{id}")
  public void deleteAccount(@PathVariable Long id) {
    accountService.deleteAccount(id);
  }

  @PostMapping("/api/accounts/{id}/statement")
  public AccountResponse uploadStatement(@PathVariable Long id, @RequestBody StatementRequest request) {
    return toResponse(accountService.uploadStatement(id, request.fileName(), request.uploadedAt()));
  }

  @PostMapping("/api/accounts/submit")
  public void submitAccounts() {
    accountService.submitAccounts();
  }

  private AccountResponse toResponse(Account account) {
    return new AccountResponse(account.getId(), account.getProviderId(),
      providersService.getProvider(account.getProviderId()).name(), account.getStatement());
  }

}
