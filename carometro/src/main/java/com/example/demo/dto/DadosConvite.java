package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosConvite(
		@NotBlank
		String codigo,
		boolean utilizado,
		String data_formatada) {

}
