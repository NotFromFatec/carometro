package com.example.demo.controllers;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.example.demo.model.Administrador;
import com.example.demo.model.Convite;
import com.example.demo.repository.AdministradorRepository;
import com.example.demo.repository.ConviteRepository;
import com.example.demo.service.ConviteService;

@RestController
@RequestMapping("/api/invites")
public class ConviteController {
	
	@Autowired
	private ConviteService conviteService;

	@Autowired
	private ConviteRepository conviteRepository;
	
	@Autowired
	private AdministradorRepository administradorRepository;

	// 12. Criar Código de Convite POST
	@PostMapping
	public ResponseEntity<String> criarCodigoConvite(@RequestBody Map<String, String> mapeamento) {
		
		String amdin_id = mapeamento.get("adminId");
		if (amdin_id == null || amdin_id.isBlank()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Invalid request\"}");
		}
		
		Optional<Administrador> amdin_opc = administradorRepository.findById(Integer.parseInt(amdin_id));
		if (!amdin_opc.isPresent()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Admin not found\"}");
		}

		Administrador administrador = amdin_opc.get();


		String codigoConvite = UUID.randomUUID().toString();

		Convite convite = new Convite();
		convite.setCodigo(codigoConvite);
		convite.setUtilizado(false);
		convite.setData(LocalDate.now());
		convite.setAdministrador(administrador);
		conviteRepository.save(convite);

		HttpHeaders headers = new HttpHeaders();
		headers.set("Content-Type", "application/json");
		return new ResponseEntity<>(String.format("{\"code\": \"%s\"}", codigoConvite), headers, HttpStatus.CREATED);
	}

	// 13. Listar Códigos de Convite GET
	@GetMapping
	public ResponseEntity<List<Convite>> getConvites() {
	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.APPLICATION_JSON);
	    List<Convite> listaDeConvites = conviteRepository.findAll();
	    return new ResponseEntity<>(listaDeConvites, headers, HttpStatus.OK);
	}

	// 14. Cancelar Código de Convite PUT?o q é put?
	@PutMapping
	public ResponseEntity<String> cancelarConvite(@RequestBody Map<String, String> payload) {
		String codigo = payload.get("code");

		if (codigo == null || codigo.isBlank()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Invalid request\"}");
		}

		boolean cancelado = conviteService.CancelarConvite(codigo);

		if (cancelado) {
			return ResponseEntity.status(HttpStatus.OK).build();
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Invite not found\"}");
		}
	}
}
