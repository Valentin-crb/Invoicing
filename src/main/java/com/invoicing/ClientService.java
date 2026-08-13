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

    public Client createClient(Client client){
        return clientRepository.save(client);
    }

    public Client getClientById(Integer id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Id-ul " + id + " nu a fost gasit"));
    }
}
