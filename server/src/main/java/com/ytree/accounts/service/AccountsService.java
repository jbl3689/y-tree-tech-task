package com.ytree.accounts.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ytree.accounts.model.Account;
import com.ytree.accounts.model.Statement;

@Service
public class AccountsService {

  private final Clock clock;
  private final List<Account> accounts;
  private long nextAccountId = 5L;
  private boolean isSubmitted = false;

  public AccountsService() {
    this(Clock.systemDefaultZone());
  }

  public AccountsService(Clock clock) {
    this.clock = clock;
    LocalDate currentDate = LocalDate.now(clock);
    accounts = new ArrayList<>(List.of(
      new Account(1L, 1L, new Statement("abcdef_statement.pdf", currentDate.minusMonths(1))),
      new Account(2L, 2L, new Statement("ghijkl_statement.pdf", currentDate.minusMonths(2))),
      new Account(3L, 3L, new Statement("mnopqr_statement.pdf", currentDate.minusMonths(5))),
      new Account(4L, 4L, null)
    ));
  }

  public boolean isSubmitted() {
    return isSubmitted;
  }

  public List<Account> getAllAccounts() {
    return accounts;
  }

  public void deleteAccount(Long accountId) {
    accounts.removeIf(a -> a.getId().equals(accountId));
  }

  public Account addAccount(Long providerId) {
    if (accounts.stream().anyMatch(account -> account.getProviderId().equals(providerId))) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Provider already added");
    }
    Account account = new Account(nextAccountId++, providerId, null);
    accounts.add(account);
    return account;
  }

  public Account uploadStatement(Long accountId, String fileName, LocalDate uploadedAt) {
    if (fileName == null || fileName.isBlank() || uploadedAt == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Filename and upload date are required");
    }

    Account account = accounts.stream()
      .filter(a -> a.getId().equals(accountId))
      .findFirst()
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

    account.setStatement(new Statement(fileName, uploadedAt));
    return account;
  }

  public void submitAccounts() {
    LocalDate cutoff = LocalDate.now(clock).minusMonths(3);
    boolean allCurrent = accounts.stream().allMatch(account -> {
      Statement statement = account.getStatement();
      return statement != null && statement.getUploadedAt() != null
        && !statement.getUploadedAt().isBefore(cutoff);
    });

    if (!allCurrent) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not all accounts have recent statements uploaded");
    }
    isSubmitted = true;
  }
}
