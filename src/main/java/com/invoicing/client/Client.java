package com.invoicing.client;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Objects;

@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Numele nu poate fi gol")
    private String name;

    @NotBlank(message = "Codul fiscal nu poate fi gol")
    @Size(min = 2, max = 13, message = "Codul fiscal trebuie sa aiba intre 2 si 13 caractere")
    private String taxId;

    @NotBlank(message = "Email-ul nu poate fi gol")
    @Email(message = "Email invalid")
    private String email;

    public Client() {
    }

    public Client(Long id, String name, String taxId, String email) {
        this.id = id;
        this.name = name;
        this.taxId = taxId;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Client client = (Client) o;
        return id == client.id && Objects.equals(name, client.name) && Objects.equals(taxId, client.taxId) && Objects.equals(email, client.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, taxId, email);
    }
}
