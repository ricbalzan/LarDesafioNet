namespace LarDesafio.API.Core.DTOs
{
    public class TelefoneCreateDto
    {
        public string Numero { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty; // Ex: Celular, Comercial
        public int PessoaId { get; set; }
    }
}