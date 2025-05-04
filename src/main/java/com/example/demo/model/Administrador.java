package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "administrador")
@Getter
@Setter
public class Administrador {
	
	@Id
	@Column(name = "id", nullable = false)
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@Column(name = "nome", nullable = false)
	private String nome;
	
	@Column(name = "nomeUsuario", nullable = false)
	private String nomeUsuario;
	
	@Column(name = "senha", nullable = false)
	private String senha;
	
	@Column(name = "cargo", nullable = false)
	private String cargo;
	

}
