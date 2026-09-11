package com.ytree.accounts.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.ytree.accounts.model.Provider;

@Service
public class ProvidersService {

  private final AccountsService accountsService;

  public ProvidersService(AccountsService accountsService) {
    this.accountsService = accountsService;
  }

  private final List<Provider> providers = List.of(
    new Provider(1L, "Barclays"),
    new Provider(2L, "HSBC"),
    new Provider(3L, "Lloyds"),
    new Provider(4L, "NatWest"),
    new Provider(7L, "Santander"),
    new Provider(5L, "Vanguard"),
    new Provider(6L, "Fidelity"),
    new Provider(8L, "Hargreaves Lansdown"),
    new Provider(9L, "AJ Bell"),
    new Provider(10L, "Aviva")
  );

  public List<Provider> getProviders() {
    // Need to go through the accountsService to get the list of providers that have been added to accounts, and return only the ones remaining

    List<Long> usedProviderIds = accountsService.getAllAccounts().stream()
      .map(account -> account.getProviderId())
      .toList();

    return providers.stream()
      .filter(provider -> !usedProviderIds.contains(provider.id()))
      .toList();
  }

  public Provider getProvider(Long providerId) {
    return providers.stream()
      .filter(provider -> provider.id().equals(providerId))
      .findFirst()
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
  }

}
