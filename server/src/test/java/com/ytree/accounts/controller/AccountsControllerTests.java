package com.ytree.accounts.controller;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.ytree.accounts.service.AccountsService;
import com.ytree.accounts.service.ProvidersService;

class AccountsControllerTests {

  private final AccountsService accountsService = new AccountsService();
  private final ProvidersService providersService = new ProvidersService(accountsService);
  private final MockMvc mvc = MockMvcBuilders
      .standaloneSetup(new AccountsController(accountsService, providersService),
          new ProvidersController(providersService))
      .build();

  @Test
  void returnsAccountsWithStatementDetailsAndMissingStatements() throws Exception {
    mvc.perform(get("/api/accounts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].providerId").value(1))
        .andExpect(jsonPath("$[0].providerName").value("Barclays"))
        .andExpect(jsonPath("$[0].statement.fileName").value("abcdef_statement.pdf"))
        .andExpect(jsonPath("$[0].statement.uploadedAt", matchesPattern("\\d{4}-\\d{2}-\\d{2}")))
        .andExpect(jsonPath("$[*].statement", hasItem(nullValue())));
  }

  @Test
  void deletingAnAccountRemovesOnlyThatAccountFromSubsequentReads() throws Exception {
    mvc.perform(delete("/api/accounts/1"))
        .andExpect(status().isOk())
        .andExpect(content().string(""));

    mvc.perform(get("/api/accounts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].id", containsInAnyOrder(2, 3, 4)));
  }

  @ParameterizedTest
  @ValueSource(longs = {1L, 4L})
  void uploadsOrReplacesStatementAndReturnsUpdatedAccount(long accountId) throws Exception {
    mvc.perform(post("/api/accounts/{id}/statement", accountId)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"fileName":"AI Natural Writing Instructions.pdf","uploadedAt":"2026-09-10"}
            """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(accountId))
        .andExpect(jsonPath("$.statement.fileName").value("AI Natural Writing Instructions.pdf"))
        .andExpect(jsonPath("$.statement.uploadedAt").value("2026-09-10"));

    mvc.perform(get("/api/accounts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.id == " + accountId + ")].statement.fileName")
            .value("AI Natural Writing Instructions.pdf"))
        .andExpect(jsonPath("$[?(@.id == " + accountId + ")].statement.uploadedAt")
            .value("2026-09-10"));
  }

  @ParameterizedTest
  @ValueSource(strings = {
      "{\"uploadedAt\":\"2026-09-10\"}",
      "{\"fileName\":\"statement.pdf\"}",
      "{\"fileName\":\"   \",\"uploadedAt\":\"2026-09-10\"}"
  })
  void rejectsIncompleteStatementWithoutChangingAccount(String requestBody) throws Exception {
    mvc.perform(post("/api/accounts/4/statement")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isBadRequest());

    mvc.perform(get("/api/accounts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.id == 4)].statement", hasItem(nullValue())));
  }

  @Test
  void rejectsStatementForUnknownAccount() throws Exception {
    mvc.perform(post("/api/accounts/999/statement")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"fileName":"statement.pdf","uploadedAt":"2026-09-10"}
            """))
        .andExpect(status().isNotFound());
  }

  @Test
  void addingProviderCreatesMissingAccountAndRemovesItFromAvailableProviders() throws Exception {
    mvc.perform(post("/api/accounts")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"providerId\":10}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(jsonPath("$.providerId").value(10))
        .andExpect(jsonPath("$.providerName").value("Aviva"))
        .andExpect(jsonPath("$.statement").value(nullValue()));

    mvc.perform(get("/api/providers"))
        .andExpect(jsonPath("$[?(@.id == 10)]").isEmpty());

    mvc.perform(delete("/api/accounts/5")).andExpect(status().isOk());
    mvc.perform(get("/api/providers"))
        .andExpect(jsonPath("$[?(@.id == 10)].name").value("Aviva"));
  }

  @Test
  void rejectsDuplicateProviderWithoutAddingAnAccount() throws Exception {
    mvc.perform(post("/api/accounts")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"providerId\":1}"))
        .andExpect(status().isConflict());

    mvc.perform(get("/api/accounts"))
        .andExpect(jsonPath("$.length()").value(4));
  }

  @Test
  void rejectsUnknownProvider() throws Exception {
    mvc.perform(post("/api/accounts")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"providerId\":999}"))
        .andExpect(status().isNotFound());
  }
}
