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
public class ConviteController {
	
	@Autowired
	private ConviteService conviteService;

	@Autowired
	private ConviteRepository conviteRepository;
	
	@Autowired
	private AdministradorRepository administradorRepository;

	// 12. Criar Código de Convite POST
	@PostMapping(value = "/api/v1/invites", consumes = {"application/json", "text/plain"})
	public ResponseEntity<String> criarCodigoConvite(@RequestBody String body) {
	    Map<String, String> mapeamento;
	    try {
	        mapeamento = new com.google.gson.Gson().fromJson(body, Map.class);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Invalid request\"}");
	    }
	  String adminId = mapeamento.get("adminId");
	    if (adminId == null || adminId.isBlank()) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Invalid request\"}");
	    }

	    Optional<Administrador> adminOpc = administradorRepository.findById(Integer.parseInt(adminId));
	    if (!adminOpc.isPresent()) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Admin not found\"}");
	    }
	    Administrador administrador = adminOpc.get();
	    String code = UUID.randomUUID().toString();
	    Convite convite = new Convite();
	    convite.setCode(code);
	    convite.setUsed(false);
	    convite.setCreatedAt(LocalDate.now());
	    convite.setCreatedBy(administrador);
	    conviteRepository.save(convite);
	    HttpHeaders headers = new HttpHeaders();
	    headers.set("Content-Type", "application/json");
	    return new ResponseEntity<>(String.format("{\"code\": \"%s\"}", code), headers, HttpStatus.CREATED);
	}

	// 13. Listar Códigos de Convite GET
	@GetMapping(value = "/api/v1/invites")
	public ResponseEntity<List<Convite>> getConvites() {
	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.APPLICATION_JSON);
	    List<Convite> listaDeConvites = conviteRepository.findAll();
	    return new ResponseEntity<>(listaDeConvites, headers, HttpStatus.OK);
	}

	// 14. Cancelar Código de Convite PUT?o q é put?
	@PutMapping(value = "/api/v1/invites")
	public ResponseEntity<String> cancelarConvite(@RequestBody Map<String, String> payload) {
		String code = payload.get("code");

		if (code == null || code.isBlank()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Invalid request\"}");
		}

		boolean cancelado = conviteService.CancelarConvite(code);

		if (cancelado) {
			return ResponseEntity.status(HttpStatus.OK).build();
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Invite not found\"}");
		}
	}
}
