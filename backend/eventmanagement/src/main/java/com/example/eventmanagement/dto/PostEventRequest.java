package com.example.eventmanagement.dto;

public class PostEventRequest {
    private String eventReport;
    private Double actualExpenditure;
    private String reimbursementDetails;
    private String reportFileData;   // full base64 data URL: "data:application/pdf;base64,..."
    private String reportFileName;

    public String getEventReport()                  { return eventReport; }
    public void   setEventReport(String v)          { this.eventReport = v; }
    public Double getActualExpenditure()            { return actualExpenditure; }
    public void   setActualExpenditure(Double v)    { this.actualExpenditure = v; }
    public String getReimbursementDetails()         { return reimbursementDetails; }
    public void   setReimbursementDetails(String v) { this.reimbursementDetails = v; }
    public String getReportFileData()               { return reportFileData; }
    public void   setReportFileData(String v)       { this.reportFileData = v; }
    public String getReportFileName()               { return reportFileName; }
    public void   setReportFileName(String v)       { this.reportFileName = v; }
}