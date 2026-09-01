package com.invoicing.client;

import com.invoicing.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {
    private final ClientRepository clientRepository;

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
                .orElseThrow(() -> new ResourceNotFoundException("Id-ul " + id + " nu a fost gasit"));
    }

    public Client updateClientById(Integer id, Client updatedClient) {
        Client existent = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Id-ul " + id + " nu a fost gasit"));

        existent.setName(updatedClient.getName());
        existent.setEmail(updatedClient.getEmail());
        existent.setTaxId(updatedClient.getTaxId());

        return clientRepository.save(existent);
    }

    public void deleteClient(Integer id) {
        clientRepository.deleteById(id);
    }
}
