package com.invoicing;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/clients")
public class ClientController {

    @GetMapping
    public List<Client> getClients(){
        return List.of(
                new Client(1, "Andrei", "1900101123456", "andrei@gmail.com"),
                new Client(2, "Marius", "1950510273456", "marius@gmail.com")
        );
    }
}
