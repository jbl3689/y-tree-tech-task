package com.ytree.accounts.controller;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.ytree.accounts.service.ProvidersService;
import com.ytree.accounts.service.AccountsService;

class ProvidersControllerTests {

  private final MockMvc mvc = MockMvcBuilders
      .standaloneSetup(new ProvidersController(new ProvidersService(new AccountsService())))
      .build();

  @Test
  void returnsOnlyProvidersNotAlreadyAddedToAccounts() throws Exception {
    mvc.perform(get("/api/providers"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].id", containsInAnyOrder(5, 6, 7, 8, 9, 10)))
        .andExpect(jsonPath("$[?(@.id == 10)].name").value("Aviva"));
  }
}
