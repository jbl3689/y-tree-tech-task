package com.ytree.accounts.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.ytree.accounts.service.ProvidersService;

class ProvidersControllerTests {

  private final MockMvc mvc = MockMvcBuilders
      .standaloneSetup(new ProvidersController(new ProvidersService()))
      .build();

  @Test
  void returnsKnownProvidersIncludingOneNotYetAddedToAccounts() throws Exception {
    mvc.perform(get("/api/providers"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.id == 1)].name").value("Barclays"))
        .andExpect(jsonPath("$[?(@.id == 10)].name").value("Aviva"));
  }
}
