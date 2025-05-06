package com.example.demo.controllers;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.example.demo.model.Administrador;
import com.example.demo.repository.AdministradorRepository;
import com.example.demo.service.AdministradorService;
import com.google.gson.Gson;

@RestController
public class AdministradorController {

	@Autowired
	private AdministradorService administradorService;

	@Autowired
	private AdministradorRepository administradorRepository;

	// 8. Criar Administrador POST
	@PostMapping(value = "/api/v1/admins", consumes = {"application/json", "text/plain"})
	public ResponseEntity<Object> criarAdministrador(@RequestBody String body) {
		Administrador novoAdmin;
		System.out.println(body);
		try {
			novoAdmin = new Gson().fromJson(body, Administrador.class);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "JSON inválido"));
		}
		System.out.println("PASSOU!");
		Optional<Administrador> existente = administradorService.getAdministradorByUsername(novoAdmin.getUsername());

		if (existente.isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username já em uso"));
		}

		novoAdmin.setPasswordHash(hashPassword(novoAdmin.getPasswordHash()));
		Administrador salvo = administradorService.save(novoAdmin);
		return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
	}

	// 9. Login de Administrador POST
	@PostMapping(value = "/api/v1/login/admin", consumes = {"application/json", "text/plain"})
	public ResponseEntity<Object> loginAdministrador(@RequestBody String body) {
		Map<String, String> logarComoAdm;
		try {
			logarComoAdm = new Gson().fromJson(body, Map.class);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "JSON inválido"));
		}
		String username = logarComoAdm.get("username");
		String password = logarComoAdm.get("password");

		Optional<Administrador> adminOptional = administradorRepository.findByUsername(username);

		if (adminOptional.isPresent()) {
			Administrador admin = adminOptional.get();

			if (admin.getPasswordHash().equals(hashPassword(password))) {
				return ResponseEntity.ok(Map.of("message", "Login realizado com sucesso ", "adminId", admin.getId()));
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Senha incorreta"));
			}
		} else {
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Type", "application/json");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Admin nao encontrado"));
		}
	}

	// 10. Obter Administrador por ID GET
	@GetMapping("/api/v1/admins/id")
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
	@GetMapping("/api/v1/admins/nome")
	public ResponseEntity<String> getAdministradorByUsername(@RequestParam String username) {

		Optional<Administrador> encontroAdmByUsername = administradorRepository.findByUsername(username);

		if (encontroAdmByUsername.isPresent()) {
			Administrador admin = encontroAdmByUsername.get();
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

	private String hashPassword(String password) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
			StringBuilder hexString = new StringBuilder();
			for (byte b : hash) {
				hexString.append(String.format("%02x", b));
			}
			return hexString.toString();
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException("Erro ao hashear a senha", e);
		}
	}
}
