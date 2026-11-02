namespace LarDesafio.API.Core.DTOs
{
    public class TelefoneResponseDto
    {
        public int Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public int PessoaId { get; set; }
    }
}