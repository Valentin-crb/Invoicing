package com.invoicing.invoice;

import com.invoicing.product.Product;
import com.invoicing.product.ProductRepository;
import com.invoicing.ResourceNotFoundException;
import com.invoicing.client.Client;
import com.invoicing.client.ClientRepository;
import com.invoicing.client.CreateInvoiceRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, ClientRepository clientRepository, ProductRepository productRepository) {
        this.invoiceRepository = invoiceRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
    }

    public List<Invoice> getAllInvoices(){
        return invoiceRepository.findAll();
    }

    public Invoice createInvoice(CreateInvoiceRequest request){
        Invoice invoice = new Invoice();

        Integer idClient = request.getClientId();
        Client client = clientRepository.findById(idClient).orElseThrow(() -> new RuntimeException("Clientul cu id " + idClient + " nu a fost gasit"));
        List<InvoiceLine> invoiceLineList = new ArrayList<>();
        for(InvoiceLineRequest line : request.getInvoiceLineRequestList()){
            InvoiceLine invoiceLine = new InvoiceLine();
            Product product = productRepository.findById(line.getProductId())
                    .orElseThrow(() -> new RuntimeException("Produsul cu id " + line.getProductId() + " nu a fost gasit"));;

            invoiceLine.setProduct(product);
            invoiceLine.setQuantity(line.getQuantity());
            invoiceLine.setPrice(product.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
            invoiceLine.setInvoice(invoice);

            invoiceLineList.add(invoiceLine);
        }

        invoice.setInvoiceLine(invoiceLineList);
        invoice.setClient(client);
        invoice.setInvoiceStatus(InvoiceStatus.PENDING);
        invoice.setDate(LocalDate.now());
        return invoiceRepository.save(invoice);
    }


    public Invoice getInvoice(Integer id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura cu id " + id + " nu a fost gasita"));
    }

    public Invoice updateInvoiceStatus(Integer id, InvoiceStatusRequest request){
        Invoice deSchimbat = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura cu id " + id + " nu a fost gasita"));
        deSchimbat.setInvoiceStatus(request.getStatus());
        invoiceRepository.save(deSchimbat);
        return deSchimbat;
    }
}
