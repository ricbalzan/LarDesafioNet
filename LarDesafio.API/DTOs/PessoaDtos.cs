namespace LarDesafio.API.DTOs;

public record CriarPessoaDto(
    string Nome, 
    string Cpf, 
    DateTime DataNascimento
);

public record AtualizarPessoaDto(
    string Nome, 
    string Cpf, 
    DateTime DataNascimento, 
    bool Ativo
);

public record PessoaResponseDto(
    int Id, 
    string Nome, 
    string Cpf, 
    DateTime DataNascimento, 
    bool Ativo
);