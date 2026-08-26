package com.invoicing;

import java.math.BigDecimal;

public class InvoiceLineRequest {

    private Integer productId;
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
