package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Curso;
import com.example.demo.repository.CursoRepository;

@Service
public class CursoService {

	@Autowired
	private CursoRepository repository;

	public void save(List<String> names) {
		repository.deleteAll();
        List<Curso> cursos = names.stream()
                .map(Curso::new)
                .collect(Collectors.toList());
        repository.saveAll(cursos);
	}
	

	public List<Curso> listar() {
        return repository.findAll()
               /* .stream()
                .map(Course::getName)
                .collect(Collectors.toList())*/;
    }
	
	public List<String> listarNomes() {
        return repository.findAll().stream().map(Curso::getName).collect(Collectors.toList());
    }
}
