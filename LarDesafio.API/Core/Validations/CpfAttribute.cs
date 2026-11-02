using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace LarDesafio.API.Core.Validations;

public class CpfAttribute : ValidationAttribute
{
    public CpfAttribute()
    {
        ErrorMessage = "O CPF informado é inválido.";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            return ValidationResult.Success; // Se for nulo ou vazio, deixa a validação do [Required] tratar
        }

        string cpf = Regex.Replace(value.ToString()!, @"[^\d]", "");

        if (cpf.Length != 11)
            return new ValidationResult(ErrorMessage);

        // Bloqueia CPFs com todos os dígitos iguais (ex: 111.111.111-11)
        if (new string(cpf[0], 11) == cpf)
            return new ValidationResult(ErrorMessage);

        int[] multiplicador1 = new int[9] { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
        int[] multiplicador2 = new int[10] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

        string tempCpf = cpf.Substring(0, 9);
        int soma = 0;

        for (int i = 0; i < 9; i++)
            soma += int.Parse(tempCpf[i].ToString()) * multiplicador1[i];

        int resto = soma % 11;
        if (resto < 2)
            resto = 0;
        else
            resto = 11 - resto;

        string digito = resto.ToString();
        tempCpf = tempCpf + digito;
        soma = 0;

        for (int i = 0; i < 10; i++)
            soma += int.Parse(tempCpf[i].ToString()) * multiplicador2[i];

        resto = soma % 11;
        if (resto < 2)
            resto = 0;
        else
            resto = 11 - resto;

        digito = digito + resto.ToString();

        if (!cpf.EndsWith(digito))
            return new ValidationResult(ErrorMessage);

        return ValidationResult.Success;
    }
}