using LarDesafio.API.Core.DTOs; // Ajuste para o namespace correto onde o TelefoneResponseDto foi criado

namespace LarDesafio.API.Core.DTOs
{
    public class PessoaResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cpf { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public bool Ativo { get; set; }
        
        // Lista de telefones associados
        public ICollection<TelefoneResponseDto> Telefones { get; set; } = new List<TelefoneResponseDto>();
    }
}