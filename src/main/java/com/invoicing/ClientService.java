package com.invoicing;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {
    public final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> getAllClients(){
        return clientRepository.findAll();
    }
}
