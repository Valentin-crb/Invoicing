package com.invoicing.client;

import com.invoicing.invoice.InvoiceLineRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateInvoiceRequest {

    @NotNull(message = "clientId este obligatoriu")
    private Integer clientId;
    @NotEmpty(message = "Factura trebuie sa contina cel putin o linie")
    @Valid
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
