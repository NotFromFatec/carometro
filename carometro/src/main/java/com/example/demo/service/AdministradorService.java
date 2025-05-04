package com.example.demo.service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.model.Administrador;
import com.example.demo.repository.AdministradorRepository;

@Service
public class AdministradorService {
	@Autowired
	private AdministradorRepository repository;
	
	public Administrador getAdministradorById(int id) {
		return repository.getReferenceById(id);
	}
	
	public Optional<Administrador> getAdministradorByUsuario(String nomeUsuario){
		return repository.findByNomeUsuario(nomeUsuario);
	}
	
	public Administrador save(Administrador adm) {
		return repository.save(adm);
	}
	
}
