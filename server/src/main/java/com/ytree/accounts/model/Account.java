package com.ytree.accounts.model;

public class Account {

  Long id;
  Long providerId;
  Statement statement;

  public Account(Long id, Long providerId, Statement statement) {
    this.id = id;
    this.providerId = providerId;
    this.statement = statement;
  }

  public Long getId() {
    return id;
  }

  public Long getProviderId() {
    return providerId;
  }

  public Statement getStatement() {
    return statement;
  }

  
}
