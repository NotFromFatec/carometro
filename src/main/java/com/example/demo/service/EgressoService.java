package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Egresso;
import com.example.demo.repository.EgressoRepository;

@Service
public class EgressoService {
    @Autowired
    private EgressoRepository repository;

    public Egresso findEgressoByUsername(String username) {
        return repository.findEgressoByUsername(username);
    }

    public Egresso save(Egresso e) {
        return repository.save(e);
    } 

    public List<Egresso> listar() {
        return repository.findAll();
    }

    public Egresso getEgressoById(int id) {
        return repository.getReferenceById(id);
    }

    public void deleEgressoById(int id) {
        repository.deleteById(id);
    }
}
