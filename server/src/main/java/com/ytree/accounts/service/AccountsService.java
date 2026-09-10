package com.ytree.accounts.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ytree.accounts.model.Account;
import com.ytree.accounts.model.Statement;

@Service
public class AccountsService {

  private final LocalDate currentDate = LocalDate.now();
  
  private final List<Account> accounts = List.of(
    new Account(1L, 1L, new Statement("abcdef_statement.pdf", currentDate.minusMonths(1))),
    new Account(2L, 2L, new Statement("ghijkl_statement.pdf", currentDate.minusMonths(2))),
    new Account(3L, 3L, new Statement("mnopqr_statement.pdf", currentDate.minusMonths(5))),
    new Account(4L, 4L, null)
  );

  public List<Account> getAllAccounts() {
    return accounts;
  }
}
