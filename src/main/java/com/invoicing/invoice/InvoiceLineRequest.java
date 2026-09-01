package com.invoicing.invoice;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class InvoiceLineRequest {

    @NotNull(message = "clientId este obligatoriu")
    private Integer productId;
    @Min(value = 1, message = "Cantitatea trebuie sa fie cel putin 1")
    private Integer quantity;

    public InvoiceLineRequest() {
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
