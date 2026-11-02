namespace LarDesafio.API.Core.Entities
{
    public class Telefone
    {
        public int Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty; // Ex: Celular, Comercial, Residencial

        // Chave estrangeira e propriedade de navegação para a Pessoa
        public int PessoaId { get; set; }
        public Pessoa? Pessoa { get; set; }
    }
}