package com.invoicing;

import java.util.List;

public class CreateInvoiceRequest {

    private Integer clientId;
    private List<InvoiceLineRequest> invoiceLineRequestList;

    public CreateInvoiceRequest() {
    }

    public Integer getClientId() {
        return clientId;
    }

    public void setClientId(Integer clientId) {
        this.clientId = clientId;
    }

    public List<InvoiceLineRequest> getInvoiceLineRequestList() {
        return invoiceLineRequestList;
    }

    public void setInvoiceLineRequestList(List<InvoiceLineRequest> invoiceLineRequestList) {
        this.invoiceLineRequestList = invoiceLineRequestList;
    }
}
