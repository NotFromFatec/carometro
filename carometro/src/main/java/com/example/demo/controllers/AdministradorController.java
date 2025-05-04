package com.example.demo.controllers;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.example.demo.model.Administrador;
import com.example.demo.repository.AdministradorRepository;
import com.example.demo.service.AdministradorService;
import com.google.gson.Gson;

@RestController
@RequestMapping("/api/admins")
public class AdministradorController {

	@Autowired
	private AdministradorService administradorService;

	@Autowired
	private AdministradorRepository administradorRepository;

	// 8. Criar Administrador POST
	@PostMapping
	public ResponseEntity<Object> criarAdministrador(@RequestBody Administrador novoAdmin) {
		System.out.println("PASSOU!");
		Optional<Administrador> existente = administradorService.getAdministradorByUsuario(novoAdmin.getNomeUsuario());

		if (existente.isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username já em uso"));
		}

		Administrador salvo = administradorService.save(novoAdmin);
		return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
	}

	// 9. Login de Administrador POST
	@PostMapping("/login")
	public ResponseEntity<Object> loginAdministrador(@RequestBody Map<String, String> logarComoAdm) {
		String usuario = logarComoAdm.get("usuario");
		String senha = logarComoAdm.get("senha");

		Optional<Administrador> adminOptional = administradorRepository.findByNomeUsuario(usuario);

		if (adminOptional.isPresent()) {
			Administrador admin = adminOptional.get();

			if (admin.getSenha().equals(senha)) {
				return ResponseEntity.ok(Map.of("message", "Login realizado com sucesso ", "adminId", admin.getId()));
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Senha incorreta"));
			}
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Admin nao encontrado"));
		}
	}

	// 10. Obter Administrador por ID GET
	@GetMapping("/id")
	public ResponseEntity<String> getAdministradorById(@RequestParam int id) {

		Optional<Administrador> encontroAdmById = administradorRepository.findById(id);

		if (encontroAdmById.isPresent()) {
			Administrador admin = encontroAdmById.get();
			Gson gson = new Gson();
			String json = gson.toJson(admin);
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Type", "application/json");
			return new ResponseEntity<>(json, headers, HttpStatus.OK);

		} else {
			String errorJson = "{ \"message\": \"Admin nao encontrado\" }";
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Type", "application/json");
			return new ResponseEntity<>(errorJson, headers, HttpStatus.NOT_FOUND);
		}
	}

	// 11. Obter Administrador por Nome de Usuário GET
	@GetMapping("/nome")
	public ResponseEntity<String> getAdministradorByNome_usuario(@RequestParam String nomeUsuario) {

		Optional<Administrador> encontroAdmByNome_usuario = administradorRepository.findByNomeUsuario(nomeUsuario);

		if (encontroAdmByNome_usuario.isPresent()) {
			Administrador admin = encontroAdmByNome_usuario.get();
			Gson gson = new Gson();
			String json = gson.toJson(admin);
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Type", "application/json");
			return new ResponseEntity<>(json, headers, HttpStatus.OK);

		} else {
			String errorJson = "{ \"message\": \"Admin nao encontrado\" }";
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Type", "application/json");
			return new ResponseEntity<>(errorJson, headers, HttpStatus.NOT_FOUND);
		}
	}
}
