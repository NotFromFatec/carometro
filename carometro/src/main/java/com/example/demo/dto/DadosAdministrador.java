package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosAdministrador(
		@NotBlank
		int id,
		String nome_usuario,
		String cargo) {

}
