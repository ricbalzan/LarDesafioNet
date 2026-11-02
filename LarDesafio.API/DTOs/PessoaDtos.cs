using System.ComponentModel.DataAnnotations;
using LarDesafio.API.Core.Validations;
using LarDesafio.API.Core.DTOs; // Garante a inclusão do TelefoneResponseDto

namespace LarDesafio.API.DTOs;

public record CriarPessoaDto(
    [param: Required(ErrorMessage = "O nome é obrigatório.")]
    string Nome, 

    [param: Required(ErrorMessage = "O CPF é obrigatório.")]
    [param: Cpf(ErrorMessage = "O CPF informado é inválido.")]
    string Cpf, 

    DateTime DataNascimento
);

public record AtualizarPessoaDto(
    [param: Required(ErrorMessage = "O nome é obrigatório.")]
    string Nome, 

    [param: Required(ErrorMessage = "O CPF é obrigatório.")]
    [param: Cpf(ErrorMessage = "O CPF informado é inválido.")]
    string Cpf, 

    DateTime DataNascimento, 
    bool Ativo
);

public record PessoaResponseDto(
    int Id, 
    string Nome, 
    string Cpf, 
    DateTime DataNascimento, 
    bool Ativo,
    List<TelefoneResponseDto>? Telefones = null
)
{
    // Construtor sem parâmetros necessário para inicializadores de objeto no C#
    public PessoaResponseDto() : this(0, string.Empty, string.Empty, DateTime.MinValue, true, new List<TelefoneResponseDto>()) { }
};