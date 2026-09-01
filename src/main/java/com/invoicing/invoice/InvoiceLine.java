package com.invoicing.invoice;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.invoicing.product.Product;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class InvoiceLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JsonBackReference
    private Invoice invoice;

    @ManyToOne
    private Product product;

    private Integer quantity;
    private  BigDecimal price;

    public InvoiceLine() {
    }


    public InvoiceLine(Integer id, Invoice invoice, Product product, Integer quantity, BigDecimal price) {
        this.id = id;
        this.invoice = invoice;
        this.product = product;
        this.quantity = quantity;
        this.price = price;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price){
        this.price = price;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

}
