package com.invoicing;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }


    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product getProductById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul cu id " + id + " nu a fost gasit"));
    }

    public Product updateProductById(Integer id, Product updatedProduct) {
        Product modificat = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul cu id " + id + " nu a fost gasit"));

        modificat.setName(updatedProduct.getName());
        modificat.setUnitPrice(updatedProduct.getUnitPrice());
        modificat.setVatRate(updatedProduct.getVatRate());

        return productRepository.save(modificat);
    }

    public void deleteProductById(Integer id) {
        productRepository.deleteById(id);
    }
}
