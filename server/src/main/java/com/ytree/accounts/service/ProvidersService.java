package com.ytree.accounts.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ytree.accounts.model.Provider;

@Service
public class ProvidersService {

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
    return providers;
  }

}
