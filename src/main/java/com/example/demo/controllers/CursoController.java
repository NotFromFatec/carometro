package com.example.demo.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Convite;
import com.example.demo.model.Curso;
import com.example.demo.model.Egresso;
import com.example.demo.service.CursoService;
import com.google.gson.Gson;

@RestController
public class CursoController {

	@Autowired
	private CursoService cursoService;

	// 15. Listar Cursos GET
	@GetMapping("/api/v1/courses")
	public ResponseEntity<Object> listarCursos() {
		List<String> nomes = cursoService.listarNomes();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		Gson gson = new Gson();
		return new ResponseEntity<>(gson.toJson(nomes), headers, HttpStatus.OK);
	}

	// 16. Salvar (Atualizar) Curso
	@PutMapping(value = "/api/v1/courses", consumes = { "application/json", "text/plain" })
    public ResponseEntity<Void> salvarCursos(@RequestBody String cursosString) {
		Gson gson = new Gson();
		List<String> cursos = gson.fromJson(cursosString, List.class);
        if (cursos == null || cursos.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        cursoService.save(cursos);
        return ResponseEntity.noContent().build();
    }

}
