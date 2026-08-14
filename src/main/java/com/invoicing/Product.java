package com.invoicing;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Numele produsului nu poate fi gol")
    private String name;

    @NotNull(message = "Pretul este obligatoriu")
    @DecimalMin(value = "0.0",inclusive = false, message = "Pretul nu poate fi negativ")
    private BigDecimal unitPrice;

    @NotNull(message = "Cota de TVA este obligatorie")
    private BigDecimal vatRate;

    public Product() {
    }

    public Product(Integer id, String name, BigDecimal unitPrice, BigDecimal vatRate) {
        this.id = id;
        this.name = name;
        this.unitPrice = unitPrice;
        this.vatRate = vatRate;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getVatRate() {
        return vatRate;
    }

    public void setVatRate(BigDecimal vatRate) {
        this.vatRate = vatRate;
    }
}
