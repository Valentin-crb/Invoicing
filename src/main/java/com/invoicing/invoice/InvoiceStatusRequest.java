package com.invoicing.invoice;

import jakarta.validation.constraints.NotNull;

public class InvoiceStatusRequest {

    private InvoiceStatus status;

    @NotNull(message = "Statusul e obligatoriu")
    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }
}
