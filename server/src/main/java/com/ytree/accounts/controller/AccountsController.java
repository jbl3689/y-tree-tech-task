package com.ytree.accounts.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ytree.accounts.model.Account;
import com.ytree.accounts.service.AccountsService;

@RestController 
public class AccountsController {

  private final AccountsService accountService;

  public AccountsController(AccountsService accountService) {
    this.accountService = accountService;
  }
  
  @GetMapping("/api/accounts")
  public List<Account> getAccounts() {
    return accountService.getAllAccounts();
  }

}
