package com.invoicing.invoice;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.invoicing.client.Client;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private Client client;

    @OneToMany(cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<InvoiceLine> invoiceLine;

    private InvoiceStatus invoiceStatus;
    private LocalDate date;

    public Invoice() {
    }

    public Invoice(Integer id, Client client, List<InvoiceLine> invoiceLine, InvoiceStatus invoiceStatus, LocalDate date) {
        this.id = id;
        this.client = client;
        this.invoiceLine = invoiceLine;
        this.invoiceStatus = invoiceStatus;
        this.date = date;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public List<InvoiceLine> getInvoiceLine() {
        return invoiceLine;
    }

    public void setInvoiceLine(List<InvoiceLine> invoiceLine) {
        this.invoiceLine = invoiceLine;
    }

    public InvoiceStatus getInvoiceStatus() {
        return invoiceStatus;
    }

    public void setInvoiceStatus(InvoiceStatus invoiceStatus) {
        this.invoiceStatus = invoiceStatus;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
