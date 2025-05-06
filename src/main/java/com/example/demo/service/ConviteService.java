package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.model.Convite;
import com.example.demo.repository.ConviteRepository;

@Service
public class ConviteService {
	
	@Autowired
	private ConviteRepository repository;
	
	public List<Convite> getAllConvite(){
		return repository.findAll();
	}
	
	public boolean CancelarConvite(String codigo) {
		Optional<Convite> convite = repository.findByCodigo(codigo);
		if(convite.isPresent()){
			Convite conviteUsado = convite.get();
			conviteUsado.setUtilizado(true);
			repository.save(conviteUsado);
			return true;
		}else {
			return false;
		}
	}
}
