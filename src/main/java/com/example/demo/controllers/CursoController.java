package com.example.demo.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

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
		List<Curso> cursos = cursoService.listar();

		if (!cursos.isEmpty()) {
			return ResponseEntity.ok(cursos);
		} else {
			Map<String, String> error = new HashMap<>();
			error.put("message", "Nenhum curso encontrado");
			return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
		}
	}

	// 16. Salvar (Atualizar) Curso
	@PutMapping(value = "/api/v1/courses")
    public ResponseEntity<Void> salvarCursos(@RequestBody List<String> cursos) {
        if (cursos == null || cursos.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        cursoService.save(cursos);
        return ResponseEntity.noContent().build();
    }

}
