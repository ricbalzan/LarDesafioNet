using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LarDesafio.API.Core.Entities;
using LarDesafio.API.Data;
using LarDesafio.API.DTOs;          // Para CriarPessoaDto e AtualizarPessoaDto
using LarDesafio.API.Core.DTOs;    // Para TelefoneResponseDto e PessoaResponseDto

namespace LarDesafio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PessoasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/pessoas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LarDesafio.API.Core.DTOs.PessoaResponseDto>>> ListarPessoas()
    {
        var pessoas = await _context.Pessoas
            .Include(p => p.Telefones)
            .Select(p => new LarDesafio.API.Core.DTOs.PessoaResponseDto
            {
                Id = p.Id,
                Nome = p.Nome,
                Cpf = p.Cpf,
                DataNascimento = p.DataNascimento,
                Ativo = p.Ativo,
                Telefones = p.Telefones.Select(t => new TelefoneResponseDto
                {
                    Id = t.Id,
                    Numero = t.Numero,
                    Tipo = t.Tipo,
                    PessoaId = t.PessoaId
                }).ToList()
            })
            .ToListAsync();

        return Ok(pessoas);
    }

    // GET: api/pessoas/5
    [HttpGet("{id}")]
    public async Task<ActionResult<LarDesafio.API.Core.DTOs.PessoaResponseDto>> BuscarPessoaPorId(int id)
    {
        var pessoa = await _context.Pessoas
            .Include(p => p.Telefones)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pessoa == null)
        {
            return NotFound(new { mensagem = "Pessoa não encontrada." });
        }

        var response = new LarDesafio.API.Core.DTOs.PessoaResponseDto
        {
            Id = pessoa.Id,
            Nome = pessoa.Nome,
            Cpf = pessoa.Cpf,
            DataNascimento = pessoa.DataNascimento,
            Ativo = pessoa.Ativo,
            Telefones = pessoa.Telefones.Select(t => new TelefoneResponseDto
            {
                Id = t.Id,
                Numero = t.Numero,
                Tipo = t.Tipo,
                PessoaId = t.PessoaId
            }).ToList()
        };

        return Ok(response);
    }

    // POST: api/pessoas
    [HttpPost]
    public async Task<ActionResult<LarDesafio.API.Core.DTOs.PessoaResponseDto>> CriarPessoa([FromBody] CriarPessoaDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome) || string.IsNullOrWhiteSpace(dto.Cpf))
        {
            return BadRequest(new { mensagem = "Nome e CPF são obrigatórios." });
        }

        var pessoa = new Pessoa
        {
            Nome = dto.Nome,
            Cpf = dto.Cpf,
            DataNascimento = dto.DataNascimento,
            Ativo = true
        };

        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();

        var response = new LarDesafio.API.Core.DTOs.PessoaResponseDto
        {
            Id = pessoa.Id,
            Nome = pessoa.Nome,
            Cpf = pessoa.Cpf,
            DataNascimento = pessoa.DataNascimento,
            Ativo = pessoa.Ativo,
            Telefones = new List<TelefoneResponseDto>()
        };
        
        return CreatedAtAction(nameof(BuscarPessoaPorId), new { id = pessoa.Id }, response);
    }

    // PUT: api/pessoas/5
    [HttpPut("{id}")]
    public async Task<IActionResult> AtualizarPessoa(int id, [FromBody] AtualizarPessoaDto dto)
    {
        var pessoa = await _context.Pessoas.FindAsync(id);
        if (pessoa == null)
        {
            return NotFound(new { mensagem = "Pessoa não encontrada." });
        }

        pessoa.Nome = dto.Nome;
        pessoa.Cpf = dto.Cpf;
        pessoa.DataNascimento = dto.DataNascimento;
        pessoa.Ativo = dto.Ativo;

        _context.Entry(pessoa).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/pessoas/5 (Soft Delete)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletarPessoa(int id)
    {
        var pessoa = await _context.Pessoas.FindAsync(id);
        if (pessoa == null)
        {
            return NotFound(new { mensagem = "Pessoa não encontrada." });
        }

        pessoa.Ativo = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}