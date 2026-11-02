using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LarDesafio.API.Core.Entities;
using LarDesafio.API.Data;
using LarDesafio.API.Core.DTOs;
using LarDesafio.API.DTOs;

namespace LarDesafio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelefonesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TelefonesController> _logger;

    public TelefonesController(AppDbContext context, ILogger<TelefonesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // POST: api/telefones
    [HttpPost]
    public async Task<ActionResult<TelefoneResponseDto>> CriarTelefone([FromBody] TelefoneCreateDto dto)
    {
        _logger.LogInformation("Tentativa de INCLUSÃO de Telefone: Numero={Numero}, PessoaId={PessoaId}", dto.Numero, dto.PessoaId);

        var pessoaExiste = await _context.Pessoas.AnyAsync(p => p.Id == dto.PessoaId);
        if (!pessoaExiste)
        {
            _logger.LogWarning("INCLUSÃO FALHOU: A PessoaId={PessoaId} informada não existe.", dto.PessoaId);
            return BadRequest(new { mensagem = "A pessoa associada não foi encontrada." });
        }

        var telefone = new Telefone
        {
            Numero = dto.Numero,
            Tipo = dto.Tipo,
            PessoaId = dto.PessoaId
        };

        _context.Telefones.Add(telefone);
        await _context.SaveChangesAsync();

        _logger.LogInformation("INCLUSÃO DE TELEFONE COM SUCESSO: Telefone Id={TelefoneId} associado à PessoaId={PessoaId}.", telefone.Id, telefone.PessoaId);

        var response = new TelefoneResponseDto
        {
            Id = telefone.Id,
            Numero = telefone.Numero,
            Tipo = telefone.Tipo,
            PessoaId = telefone.PessoaId
        };

        return CreatedAtAction(nameof(BuscarTelefonePorId), new { id = telefone.Id }, response);
    }

    // GET: api/telefones/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TelefoneResponseDto>> BuscarTelefonePorId(int id)
    {
        var telefone = await _context.Telefones.FindAsync(id);
        if (telefone == null)
        {
            return NotFound(new { mensagem = "Telefone não encontrado." });
        }

        return Ok(new TelefoneResponseDto
        {
            Id = telefone.Id,
            Numero = telefone.Numero,
            Tipo = telefone.Tipo,
            PessoaId = telefone.PessoaId
        });
    }

    // DELETE: api/telefones/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletarTelefone(int id)
    {
        _logger.LogInformation("Tentativa de EXCLUSÃO FÍSICA de Telefone Id: {TelefoneId}", id);

        var telefone = await _context.Telefones.FindAsync(id);
        if (telefone == null)
        {
            _logger.LogWarning("EXCLUSÃO FALHOU: Telefone Id={TelefoneId} não encontrado.", id);
            return NotFound(new { mensagem = "Telefone não encontrado." });
        }

        _context.Telefones.Remove(telefone);
        await _context.SaveChangesAsync();

        _logger.LogWarning("EXCLUSÃO FÍSICA REALIZADA: Telefone Id={TelefoneId} foi removido.", id);

        return NoContent();
    }
}