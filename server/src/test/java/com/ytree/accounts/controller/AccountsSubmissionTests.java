package com.ytree.accounts.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.ytree.accounts.service.AccountsService;
import com.ytree.accounts.service.ProvidersService;

class AccountsSubmissionTests {

  private static final LocalDate TODAY = LocalDate.of(2026, 5, 31);
  private final AccountsService service = new AccountsService(
      Clock.fixed(Instant.parse("2026-05-31T12:00:00Z"), ZoneOffset.UTC));
  private final MockMvc mvc = MockMvcBuilders
      .standaloneSetup(new AccountsController(service, new ProvidersService(service)))
      .build();

  @BeforeEach
  void giveEveryAccountACurrentStatement() {
    service.getAllAccounts().forEach(account ->
        service.uploadStatement(account.getId(), "statement.pdf", TODAY));
  }

  @Test
  void rejectsSubmissionWhenOneStatementIsMissing() throws Exception {
    service.getAllAccounts().getLast().setStatement(null);

    mvc.perform(post("/api/accounts/submit"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void rejectsSubmissionWhenOneStatementIsOlderThanThreeMonths() throws Exception {
    service.uploadStatement(4L, "old.pdf", TODAY.minusMonths(3).minusDays(1));

    mvc.perform(post("/api/accounts/submit"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void acceptsSubmissionWhenEveryStatementIsCurrent() throws Exception {
    mvc.perform(post("/api/accounts/submit"))
        .andExpect(status().isOk())
        .andExpect(content().string(""));
  }

  @ParameterizedTest
  @CsvSource({
      "2026-05-31, 2026-02-27, 400",
      "2026-05-31, 2026-02-28, 200",
      "2024-05-31, 2024-02-28, 400",
      "2024-05-31, 2024-02-29, 200",
      "2026-01-15, 2025-10-14, 400",
      "2026-01-15, 2025-10-15, 200"
  })
  void usesCalendarMonthCutoffIncludingLeapYearsAndYearChanges(
      LocalDate today, LocalDate statementDate, int expectedStatus) throws Exception {
    var datedService = new AccountsService(
        Clock.fixed(today.atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC));
    datedService.getAllAccounts().forEach(account ->
        datedService.uploadStatement(account.getId(), "current.pdf", today));
    datedService.uploadStatement(4L, "boundary.pdf", statementDate);
    var datedMvc = MockMvcBuilders.standaloneSetup(
        new AccountsController(datedService, new ProvidersService(datedService))).build();

    datedMvc.perform(post("/api/accounts/submit"))
        .andExpect(status().is(expectedStatus));
  }

  @Test
  void addingAProviderBlocksSubmissionUntilItsStatementIsUploadedThroughTheApi() throws Exception {
    mvc.perform(post("/api/accounts")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"providerId\":10}"))
        .andExpect(status().isOk());

    mvc.perform(post("/api/accounts/submit"))
        .andExpect(status().isBadRequest());

    mvc.perform(post("/api/accounts/5/statement")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"fileName":"current.pdf","uploadedAt":"2026-05-31"}
            """))
        .andExpect(status().isOk());

    mvc.perform(post("/api/accounts/submit"))
        .andExpect(status().isOk());
  }
}
