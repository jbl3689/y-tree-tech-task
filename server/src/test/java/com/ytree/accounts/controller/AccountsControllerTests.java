package com.ytree.accounts.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.ytree.accounts.service.AccountsService;

class AccountsControllerTests {

  private final MockMvc mvc = MockMvcBuilders
      .standaloneSetup(new AccountsController(new AccountsService()))
      .build();

  @Test
  void returnsAccountsWithStatementDetailsAndMissingStatements() throws Exception {
    mvc.perform(get("/api/accounts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].providerId").value(1))
        .andExpect(jsonPath("$[0].statement.fileName").value("abcdef_statement.pdf"))
        .andExpect(jsonPath("$[0].statement.uploadedAt", matchesPattern("\\d{4}-\\d{2}-\\d{2}")))
        .andExpect(jsonPath("$[*].statement", hasItem(nullValue())));
  }
}
