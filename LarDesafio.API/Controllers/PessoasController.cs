using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LarDesafio.API.Core.Entities;
using LarDesafio.API.Data;
using LarDesafio.API.DTOs;
using LarDesafio.API.Core.DTOs;

namespace LarDesafio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoasController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PessoasController> _logger;

    // Injeção de dependência do DbContext e do ILogger
    public PessoasController(AppDbContext context, ILogger<PessoasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/pessoas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LarDesafio.API.DTOs.PessoaResponseDto>>> ListarPessoas()
    {
        _logger.LogInformation("Consulta iniciada: Listando todas as pessoas com seus respetivos telefones.");

        var pessoas = await _context.Pessoas
            .Include(p => p.Telefones)
            .Select(p => new LarDesafio.API.DTOs.PessoaResponseDto(
                p.Id,
                p.Nome,
                p.Cpf,
                p.DataNascimento,
                p.Ativo,
                p.Telefones.Select(t => new TelefoneResponseDto
                {
                    Id = t.Id,
                    Numero = t.Numero,
                    Tipo = t.Tipo,
                    PessoaId = t.PessoaId
                }).ToList()
            ))
            .ToListAsync();

        _logger.LogInformation("Consulta concluída: {Quantidade} pessoas retornadas do banco de dados.", pessoas.Count);
        return Ok(pessoas);
    }

    // GET: api/pessoas/5
    [HttpGet("{id}")]
    public async Task<ActionResult<LarDesafio.API.DTOs.PessoaResponseDto>> BuscarPessoaPorId(int id)
    {
        _logger.LogInformation("Busca iniciada para Pessoa Id: {PessoaId}", id);

        var pessoa = await _context.Pessoas
            .Include(p => p.Telefones)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pessoa == null)
        {
            _logger.LogWarning("Busca falhou: Pessoa com Id: {PessoaId} não foi encontrada.", id);
            return NotFound(new { mensagem = "Pessoa não encontrada." });
        }

        var response = new LarDesafio.API.DTOs.PessoaResponseDto(
            pessoa.Id,
            pessoa.Nome,
            pessoa.Cpf,
            pessoa.DataNascimento,
            pessoa.Ativo,
            pessoa.Telefones.Select(t => new TelefoneResponseDto
            {
                Id = t.Id,
                Numero = t.Numero,
                Tipo = t.Tipo,
                PessoaId = t.PessoaId
            }).ToList()
        );

        return Ok(response);
    }

    // POST: api/pessoas
    [HttpPost]
    public async Task<ActionResult<LarDesafio.API.DTOs.PessoaResponseDto>> CriarPessoa([FromBody] CriarPessoaDto dto)
    {
        _logger.LogInformation("Tentativa de INCLUSÃO de pessoa: Nome={Nome}, CPF={Cpf}", dto.Nome, dto.Cpf);

        var pessoa = new Pessoa
        {
            Nome = dto.Nome,
            Cpf = dto.Cpf,
            DataNascimento = dto.DataNascimento,
            Ativo = true
        };

        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();

        _logger.LogInformation("INCLUSÃO REALIZADA COM SUCESSO: Pessoa cadastrada com Id={PessoaId}, Nome={Nome}.", pessoa.Id, pessoa.Nome);

        var response = new LarDesafio.API.DTOs.PessoaResponseDto(
            pessoa.Id,
            pessoa.Nome,
            pessoa.Cpf,
            pessoa.DataNascimento,
            pessoa.Ativo,
            new List<TelefoneResponseDto>()
        );
        
        return CreatedAtAction(nameof(BuscarPessoaPorId), new { id = pessoa.Id }, response);
    }

    // PUT: api/pessoas/5
    [HttpPut("{id}")]
    public async Task<IActionResult> AtualizarPessoa(int id, [FromBody] AtualizarPessoaDto dto)
    {
        _logger.LogInformation("Tentativa de ALTERAÇÃO de pessoa Id: {PessoaId}", id);

        var pessoa = await _context.Pessoas.FindAsync(id);
        if (pessoa == null)
        {
            _logger.LogWarning("ALTERAÇÃO FALHOU: Pessoa com Id: {PessoaId} não foi localizada no banco.", id);
            return NotFound(new { mensagem = "Pessoa não encontrada." });
        }

        pessoa.Nome = dto.Nome;
        pessoa.Cpf = dto.Cpf;
        pessoa.DataNascimento = dto.DataNascimento;
        pessoa.Ativo = dto.Ativo;

        _context.Entry(pessoa).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        _logger.LogInformation("ALTERAÇÃO REALIZADA COM SUCESSO: Pessoa Id={PessoaId} atualizada para Nome={Nome}, Ativo={Ativo}.", id, pessoa.Nome, pessoa.Ativo);

        return NoContent();
    }

    // DELETE: api/pessoas/5 (Soft Delete)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletarPessoa(int id)
    {
        _logger.LogInformation("Tentativa de EXCLUSÃO (Soft Delete) para Pessoa Id: {PessoaId}", id);

        var pessoa = await _context.Pessoas.FindAsync(id);
        if (pessoa == null)
        {
            _logger.LogWarning("EXCLUSÃO FALHOU: Pessoa com Id: {PessoaId} não encontrada.", id);
            return NotFound(new { mensagem = "Pessoa não encontrada." });
        }

        pessoa.Ativo = false;
        await _context.SaveChangesAsync();

        _logger.LogWarning("EXCLUSÃO REALIZADA (SOFT DELETE): Pessoa Id={PessoaId} (Nome={Nome}) desativada no sistema.", id, pessoa.Nome);

        return NoContent();
    }
}