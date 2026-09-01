package com.invoicing.invoice;

import com.invoicing.client.CreateInvoiceRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public List<Invoice> getAllInvoices(){
        return invoiceService.getAllInvoices();
    }

    @PostMapping
    public ResponseEntity<Invoice> createNewInvoice(@RequestBody @Valid CreateInvoiceRequest request){
        Invoice created = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Integer id){
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Integer id, @RequestBody @Valid InvoiceStatusRequest request){
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, request));
    }
}
