package com.ytree.accounts.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ytree.accounts.service.ProvidersService;
import com.ytree.accounts.model.Provider;

@RestController
public class ProvidersController {

  private final ProvidersService providersService;

  public ProvidersController(ProvidersService providersService) {
    this.providersService = providersService;
  }

  @GetMapping("/api/providers")
  public List<Provider> getProviders() {
    return providersService.getProviders();
  }
}
