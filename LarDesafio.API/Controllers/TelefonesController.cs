using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LarDesafio.API.Core.Entities;
using LarDesafio.API.Core.DTOs;
using LarDesafio.API.Data;

namespace LarDesafio.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TelefonesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TelefonesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/telefones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TelefoneResponseDto>>> ListarTelefones()
        {
            var telefones = await _context.Telefones
                .Select(t => new TelefoneResponseDto
                {
                    Id = t.Id,
                    Numero = t.Numero,
                    Tipo = t.Tipo,
                    PessoaId = t.PessoaId
                })
                .ToListAsync();

            return Ok(telefones);
        }

        // POST: api/telefones
        [HttpPost]
        public async Task<ActionResult<TelefoneResponseDto>> CriarTelefone([FromBody] TelefoneCreateDto dto)
        {
            // Valida se a pessoa associada realmente existe
            var pessoaExiste = await _context.Pessoas.AnyAsync(p => p.Id == dto.PessoaId);
            if (!pessoaExiste)
            {
                return NotFound(new { mensagem = "A pessoa informada não foi encontrada." });
            }

            var telefone = new Telefone
            {
                Numero = dto.Numero,
                Tipo = dto.Tipo,
                PessoaId = dto.PessoaId
            };

            _context.Telefones.Add(telefone);
            await _context.SaveChangesAsync();

            var responseDto = new TelefoneResponseDto
            {
                Id = telefone.Id,
                Numero = telefone.Numero,
                Tipo = telefone.Tipo,
                PessoaId = telefone.PessoaId
            };

            return CreatedAtAction(nameof(ListarTelefones), new { id = telefone.Id }, responseDto);
        }

        // DELETE: api/telefones/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarTelefone(int id)
        {
            var telefone = await _context.Telefones.FindAsync(id);
            if (telefone == null)
            {
                return NotFound(new { mensagem = "Telefone não encontrado." });
            }

            _context.Telefones.Remove(telefone);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}