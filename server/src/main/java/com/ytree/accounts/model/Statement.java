package com.ytree.accounts.model;

import java.time.LocalDate;

public class Statement {

  String fileName;
  LocalDate uploadedAt;

  public Statement(String fileName, LocalDate uploadedAt) {
    this.fileName = fileName;
    this.uploadedAt = uploadedAt;
  }

  public String getFileName() {
    return fileName;
  }
  

  public LocalDate getUploadedAt() {
    return uploadedAt;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public void setUploadedAt(LocalDate uploadedAt) {
    this.uploadedAt = uploadedAt;
  }
  
}
